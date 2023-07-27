const MongoDb = require('./db/mongoDb');
const SerieRepository = require('./repository/series.repository');
const { getSerieInfoByImdbKey } = require('./service/omdb.service');
const { getSeasonInfo } = require('./service/imdb.service');
const { removeTimeZone, now } = require('./util/date');

function removeTimezoneFromSeason(season) {
  for (const episode of season.episodes) {
    episode.airdate = episode.airdate ? removeTimeZone(episode.airdate) : null;
  }
  return season;
}

exports.handler = async function run(event, context, callback) {
  try {
    await new MongoDb();
    const seriesCollection = new SerieRepository();
    const seriesInMongo = await seriesCollection.findAll();
    const updatedSeriesNameArray = [];

    const promises = seriesInMongo.map(async (serie) => {
      const serieInfoInOmdb = await getSerieInfoByImdbKey(serie.imdbId);
      if (!serieInfoInOmdb) return;

      const year = serieInfoInOmdb.Year;
      const hasStartAndFinishYear =
        /^(2[0-9]{3}|2[0-9]{3})–(2[0-9]{3}|2[0-9]{3})$/.test(year);
      const hasOnlyStart = /^\d{4}$/.test(year);

      const isFinished = hasStartAndFinishYear || hasOnlyStart;

      try {
        let seasons = [];
        const serieLastSeason = await getSeasonInfo(serieInfoInOmdb.imdbID);

        // Regra - Pega a temporada anterior, caso não seja a primeira
        if (serieLastSeason.number > 1) {
          const seriePastSeason = await getSeasonInfo(
            serieInfoInOmdb.imdbID,
            serieLastSeason.number - 1
          );

          seasons.push(removeTimezoneFromSeason(seriePastSeason));
        }

        seasons.push(removeTimezoneFromSeason(serieLastSeason));

        await seriesCollection.updateSeasonsByUuid(
          serie.uuid,
          isFinished,
          seasons
        );
        updatedSeriesNameArray.push(serie.name);
      } catch (err) {
        console.error(`Erro ao buscar dados de ${serie.name} - ${serie.uuid}`);
      }
    });

    await Promise.all(promises);

    console.log('Series atualizadas: ', updatedSeriesNameArray.join(', '));
  } catch (err) {
    console.error(err);
  } finally {
    context.succeed();
  }
};
