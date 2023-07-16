const MongoDb = require('./db/mongoDb');
const SerieRepository = require('./repository/series.repository');
const { getSerieInfoByImdbKey } = require('./service/omdb.service');
const { getSeasonInfo } = require('./service/imdb.service');
const { removeTimeZone, now } = require('./util/date');
const today = now();

function removeTimezoneFromSeason(season) {
  for (const episode of season.episodes) {
    episode.airdate = removeTimeZone(episode.airdate);
  }
  return season;
}

async function run() {
  try {
    await new MongoDb();
    const seriesCollection = new SerieRepository();
    const seriesInMongo = await seriesCollection.findAll();

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
