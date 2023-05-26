import { Inject, Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { telegramApi } from './infra/config';
import { SendMessageTelegramBodyDto } from './dto/body.interface';
import { UsersMongoRepository } from './entity/users/users.repository';
import { SeriesMongoRepository } from './entity/series/series.repository';
import { Serie } from './domain/serie';
import { OmdbService } from './omdb/omdb.service';
import { User } from './domain/user';
import { now, sleep } from './util/date';
import { get } from 'lodash';
import { format } from 'date-fns';
import { QuestionsMongoRepository } from './entity/questions/questions.repository';
import { Choice, Question } from './domain/question';

@Injectable()
export class AppService {
  private telegramBot: TelegramBot;

  constructor(
    @Inject('UserRepository')
    private readonly usersMongoRepository: UsersMongoRepository,
    @Inject('SerieRepository')
    private readonly seriesMongoRepository: SeriesMongoRepository,
    @Inject('QuestionRepository')
    private readonly questionsMongoRepository: QuestionsMongoRepository,
    private readonly omdbService: OmdbService,
  ) {}

  startEventListener() {
    this.telegramBot = new TelegramBot(telegramApi.token, { polling: true });
    this.telegramBot.onText(/$/, async (message) => {
      const {
        from: { first_name, id },
        text,
      } = message;
      const textSplitted = text.trim().split(' ');
      const command = textSplitted.shift();
      const formattedMessage = textSplitted.join(' ').trim();

      let user = await this.usersMongoRepository.findByTelegramId({
        telegramId: id,
      });

      if (!user) {
        user = await this.usersMongoRepository.save({
          telegramId: id,
          name: first_name,
        });
      }

      switch (command) {
        case '/cadastrarserie':
          await this.cleanUserQuestion({ user });
          await this.saveSerieOnUser({ id, message: formattedMessage, user });
          break;
        case '/listarseries':
          await this.cleanUserQuestion({ user });
          await this.listUserSeries({ id, user });
          break;
        case '/limparseries':
          await this.cleanUserQuestion({ user });
          await this.cleanSeriesList({ id, user });
          break;
        case '/start':
          await this.sendMessage({
            telegramId: id,
            message: [
              'Olá! Eu sou Iris, seu bot de séries.',
              'Posso notificar você no dia que suas séries favoritas lançarem episódios!',
            ].join('\n'),
          });
          break;
        default:
          const question = await this.questionsMongoRepository.findByUserUuid({
            userUuid: user.uuid,
          });

          if (!question) {
            return this.sendMessage({
              telegramId: id,
              message: 'Desculpa, não entendi. Poderia repetir por favor.',
            });
          }

          await this.processUserAnswer({
            id,
            message: command,
            user,
            userQuestion: question,
          });
      }
    });
  }

  sendMessage({
    telegramId,
    message,
    disableWebPagePreview,
  }: SendMessageTelegramBodyDto) {
    this.telegramBot.sendMessage(telegramId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: disableWebPagePreview,
    });
  }

  async saveSerieOnUser({ id, message, user }: ParsedInputMessage) {
    let userAlreadyHasSerie;
    let serie: Serie;

    if (message.startsWith('tt', 0)) {
      serie = await this.seriesMongoRepository.findByImdbId({
        imdbId: message,
      });

      userAlreadyHasSerie = serie
        ? user.seriesUuid.includes(serie.uuid)
        : false;

      if (!serie && !userAlreadyHasSerie) {
        const result = await this.omdbService.searchSerieByImdbId(message);

        if (result) {
          serie = await this.seriesMongoRepository.save({
            name: result.Title,
            imdbId: result.imdbID,
          });
        }
      }

      if (!serie) {
        return this.sendMessage({
          telegramId: id,
          message: 'Serie não encontrada. Tente novamente por favor',
        });
      }
    } else {
      serie = await this.seriesMongoRepository.findByName({
        name: message,
      });

      if (!serie) {
        // Fluxo de cadastrar por nome
        return this.searchSerieExternally({ id, message, user });
      }

      userAlreadyHasSerie = serie
        ? user.seriesUuid.includes(serie.uuid)
        : false;
    }

    if (userAlreadyHasSerie) {
      return this.sendMessage({
        telegramId: id,
        message: 'Série já cadastrada',
      });
    }

    await this.usersMongoRepository.pushSerieUuidInUserByUuid(
      {
        uuid: user.uuid,
      },
      serie.uuid,
    );

    return this.sendMessage({
      telegramId: id,
      message: 'Serie cadastrada com sucesso!',
    });
  }

  async searchSerieExternally({ id, message, user }: ParsedInputMessage) {
    const results = await this.omdbService.searchSerieByName(message);

    if (results.Response === 'False') {
      return this.sendMessage({
        telegramId: id,
        message: 'Desculpa, não consegui encontrar nenhum resultado',
      });
    }

    const possibilities = results.Search.map((searchResult) => ({
      poster: searchResult.Poster,
      name: searchResult.Title,
      imdbId: searchResult.imdbID,
    }));

    const choices: Choice[] = possibilities
      .slice(0, 3)
      .map((possibility, index) => ({
        answer: `${index + 1}`,
        imdbId: possibility.imdbId,
        name: possibility.name,
        poster: possibility.poster,
      }));

    const question = new Question(user.uuid, choices);
    await this.questionsMongoRepository.updateQuestion(question);

    for (const choice of choices) {
      await this.sendMessage({
        telegramId: id,
        message: [
          `Opção ${choice.answer}`,
          `${choice.name}`,
          choice.poster,
        ].join('\n'),
        disableWebPagePreview: false,
      });
      await sleep(100);
    }

    return this.sendMessage({
      telegramId: id,
      message:
        'Por favor escolha uma opção. Para escolher apenas digite o número escolhido',
    });
  }

  async listUserSeries({ id, user }: ParsedInputMessage) {
    if (!user.seriesUuid.length) {
      return this.sendMessage({
        telegramId: id,
        message: [
          'Você ainda não cadastrou nenhuma série para acompanhar 😟',
          'Para cadastrar use o comando <b>\\cadastrarserie NOME_DA_SERIE </b>',
        ].join('\n'),
      });
    }

    const series = await this.seriesMongoRepository.findInUuidArray(
      user.seriesUuid,
    );

    const seriesMessage = [];

    for (const serie of series) {
      const data = this.getLastAndNextEpisodes(serie);

      const lastSeasonsData = [];

      if (data.lastEpisode) {
        const formattedDate = format(
          data.lastEpisode.episodeAirdate,
          'dd/MM/yyyy',
        );
        lastSeasonsData.push(
          [
            `  🔚  Temp. ${data.lastEpisode.seasonNumber} Ep. ${data.lastEpisode.episodeNumber} - ${formattedDate}`,
          ].join('\n'),
        );
      }

      if (data.nextEpisode) {
        const formattedDate = format(
          data.nextEpisode.episodeAirdate,
          'dd/MM/yyyy',
        );
        lastSeasonsData.push(
          [
            `  🔜  Temp. ${data.nextEpisode.seasonNumber} Ep. ${data.nextEpisode.episodeNumber} - ${formattedDate}`,
          ].join('\n'),
        );
      }

      seriesMessage.push(
        [`<b>${serie.name}</b>`, ...lastSeasonsData].join('\n'),
      );
    }

    return this.sendMessage({
      telegramId: id,
      message: seriesMessage.join('\n\n'),
    });
  }

  getLastAndNextEpisodes(serie: Serie): {
    lastEpisode: EpisodeBasicInfo;
    nextEpisode: EpisodeBasicInfo;
  } {
    const today = now();
    let lookingAtEpisode: EpisodeBasicInfo;

    for (
      let seasonIndex = serie.seasons.length - 1;
      seasonIndex >= 0;
      seasonIndex--
    ) {
      const seasonNumber = serie.seasons[seasonIndex].number;

      for (
        let episodeIndex = serie.seasons[seasonIndex].episodes.length - 1;
        episodeIndex >= 0;
        episodeIndex--
      ) {
        const episode = serie.seasons[seasonIndex].episodes[episodeIndex];
        if (episode.airdate <= today) {
          const hasNextEpisode = get(lookingAtEpisode, 'seasonNumber');
          return {
            lastEpisode: {
              seasonNumber,
              episodeNumber: episode.number,
              episodeAirdate: episode.airdate,
            },
            nextEpisode: hasNextEpisode
              ? {
                  seasonNumber:
                    lookingAtEpisode.seasonNumber === 1
                      ? seasonNumber + 1
                      : seasonNumber,
                  episodeNumber: lookingAtEpisode.seasonNumber,
                  episodeAirdate: lookingAtEpisode.episodeAirdate,
                }
              : null,
          };
        } else {
          lookingAtEpisode = {
            seasonNumber,
            episodeNumber: episode.number,
            episodeAirdate: episode.airdate,
          };
        }
      }
    }

    return {
      lastEpisode: null,
      nextEpisode: lookingAtEpisode,
    };
  }

  async cleanSeriesList({ id, user }: ParsedInputMessage) {
    await this.usersMongoRepository.cleanSeriesFromUser(user);
    await this.sendMessage({
      telegramId: id,
      message: 'Lista limpa com sucesso!',
    });
  }

  async cleanUserQuestion({ user }: ParsedInputMessage) {
    await this.questionsMongoRepository.deleteOneByUserUuid({
      userUuid: user.uuid,
    });
  }

  async processUserAnswer({
    id,
    message,
    user,
    userQuestion,
  }: ParsedInputMessage) {
    const userAnswer = userQuestion.choices.find(
      (choice) => choice.answer === message,
    );
    if (!userAnswer) {
      return this.sendMessage({
        telegramId: id,
        message:
          'Desculpa, não entendi sua resposta. Poderia me informar novamente por favor',
      });
    }
    // Regra - verificar se não foi cadastrada por outro usuário
    let serieInMongo = await this.seriesMongoRepository.findByImdbId({
      imdbId: userAnswer.imdbId,
    });

    if (!serieInMongo) {
      serieInMongo = await this.seriesMongoRepository.save({
        name: userAnswer.name,
        imdbId: userAnswer.imdbId,
      });
    }

    await this.usersMongoRepository.pushSerieUuidInUserByUuid(
      {
        uuid: user.uuid,
      },
      serieInMongo.uuid,
    );

    return this.sendMessage({
      telegramId: id,
      message: 'Serie cadastrada com sucesso!',
    });
  }
}

interface ParsedInputMessage {
  user: User;
  id?: number;
  message?: string;
  userQuestion?: Question;
}

interface EpisodeBasicInfo {
  seasonNumber: number;
  episodeNumber: number;
  episodeAirdate: Date;
}
