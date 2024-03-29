const MongoDb = require('./db/mongoDb');
const SerieRepository = require('./repository/series.repository');
const UserRepository = require('./repository/users.repository');
const MessageService = require('./services/message.service');
const { now } = require('./util/date');
const today = now();

function getReleaseEpisodeInfoFromSerie(serie) {
  for (const season of serie.seasons) {
    for (const episode of season.episodes) {
      if (episode.airdate.getTime() === today.getTime()) {
        return {
          seasonNumber: season.number,
          episodeNumber: episode.number,
        };
      }
    }
  }
}

function formatSerieName(name) {
  if (name.length > 22) return name.slice(0, 22).trim() + '...';
  return name;
}

exports.handler = async function run(event, context, callback) {
  try {
    await new MongoDb();

    const seriesCollection = new SerieRepository();
    const userRepository = new UserRepository();
    const messageService = new MessageService();

    const seriesInMongo = await seriesCollection.findSeriesByDate(today);

    if (!seriesInMongo.length) return;

    const seriesInfo = seriesInMongo.map((serie) => {
      const episodeInfo = getReleaseEpisodeInfoFromSerie(serie);
      return {
        uuid: serie.uuid,
        name: serie.name,
        seasonNumber: episodeInfo.seasonNumber,
        episodeNumber: episodeInfo.episodeNumber,
      };
    });
    const usersInMongo = await userRepository.findBySeriesUuid(
      seriesInfo.map(({ uuid }) => uuid)
    );

    const dataToSend = [];

    for (const user of usersInMongo) {
      const { telegramId } = user;

      const userSeries = user.seriesUuid
        .map((uuid) => {
          return seriesInfo.find((serieInfo) => serieInfo.uuid === uuid);
        })
        .filter((el) => el);

      dataToSend.push({
        telegramId,
        userSeries,
      });
    }

    await Promise.all(
      dataToSend.map(({ telegramId, userSeries }) => {
        const message = [
          '<b>Bom dia!</b>',
          'Hoje as seguintes séries terão novos episódios:',
          ...userSeries.map(
            ({ name, seasonNumber, episodeNumber }) =>
              `<b>${formatSerieName(
                name
              )} - Temp. ${seasonNumber} Ep. ${episodeNumber}</b>`
          ),
        ].join('\n');

        return messageService.sendMessageToUser(telegramId, message);
      })
    );
  } catch (err) {
    console.error(err);
  } finally {
    context.succeed();
  }
};
