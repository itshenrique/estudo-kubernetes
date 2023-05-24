import { Inject, Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { telegramApi } from './infra/config';
import { SendMessageTelegramBodyDto } from './dto/body.interface';
import { UsersMongoRepository } from './entity/users/users.repository';
import { SeriesMongoRepository } from './entity/series/series.repository';
import { Serie } from './domain/serie';
import { OmdbService } from './omdb/omdb.service';
import { User } from './domain/user';

@Injectable()
export class AppService {
  private telegramBot: TelegramBot;

  constructor(
    @Inject('UserRepository')
    private readonly usersMongoRepository: UsersMongoRepository,
    @Inject('SerieRepository')
    private readonly seriesMongoRepository: SeriesMongoRepository,
    private readonly omdbService: OmdbService,
  ) {}

  startEventListener() {
    this.telegramBot = new TelegramBot(telegramApi.token, { polling: true });
    this.telegramBot.onText(/$/, async (message) => {
      const {
        from: { first_name, id },
        text,
      } = message;
      console.log(first_name, text);
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
        case '/cadastrarSerie':
          await this.saveSerieOnUser({ id, message: formattedMessage, user });
          break;
        case '/start':
          this.sendMessage({
            telegramId: id,
            message: [
              'Olá! Eu sou Iris, seu bot de séries.',
              'Posso notificar você no dia que suas séries favoritas lançarem episódios!',
            ].join('\n'),
          });
          break;
        default:
          this.sendMessage({
            telegramId: id,
            message: 'Desculpa, não entendi. Poderia repetir por favor.',
          });
      }
    });
  }

  sendMessage({ telegramId, message }: SendMessageTelegramBodyDto) {
    this.telegramBot.sendMessage(telegramId, message, {
      parse_mode: 'HTML',
    });
  }

  async saveSerieOnUser({
    id,
    message,
    user,
  }: {
    id: number;
    message: string;
    user: User;
  }) {
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
        return this.sendMessage({
          telegramId: id,
          message: 'Serie não encontrada. Por favor reporte ao admin',
        });
      }

      userAlreadyHasSerie = serie
        ? user.seriesUuid.includes(serie.uuid)
        : false;
      // TODO pesquisar no OMDB
      // TODO atualizar a serie com os dados do IMDB
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

    this.sendMessage({
      telegramId: id,
      message: 'Serie cadastrada com sucesso!',
    });
  }
}
