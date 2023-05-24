const MongoDb = require('./db/mongoDb');
const SerieRepository = require('./repository/series.repository');
const { getSerieInfoByName } = require('./service/omdb.service');
const { getLastSeasonInfo } = require('./service/imdb.service');
const { removeTimeZone, now } = require('./util/date');
const today = now();

async function run() {
  try {
    await new MongoDb();
    const seriesCollection = new SerieRepository();
    const seriesInMongo = await seriesCollection.findAll();

    const promises = seriesInMongo.map(async (serie) => {
      const serieInfoInOmdb = await getSerieInfoByName(serie.imdbId);
      if (!serieInfoInOmdb) return;

      try {
        const serieLastSeason = await getLastSeasonInfo(serieInfoInOmdb.imdbID);
        const hasBeenSaved = serie.seasons.some(
          (season) => season.number === Number(serieLastSeason.number)
        );

        const episodes = serieLastSeason.episodes
          .map((episode) => ({
            ...episode,
            airdate: removeTimeZone(episode.airdate),
          }))
          .filter(({ airdate }) => airdate >= today);

        if (hasBeenSaved) {
          await seriesCollection.updateLastSeasonByName(serie.uuid, {
            number: serieLastSeason.number,
            episodes,
          });
        } else {
          await seriesCollection.createSeasonByName(serie.uuid, {
            number: serieLastSeason.number,
            episodes,
          });
        }
      } catch (err) {
        console.error(err);
        console.error('Erro ao buscar dados de ' + serie.uuid);
      }
    });

    await Promise.all(promises);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
