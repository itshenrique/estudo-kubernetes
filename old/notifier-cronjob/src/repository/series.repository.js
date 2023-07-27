const { SeriesModel } = require('../model/series');

class SerieRepository {
  findSeriesByDate(date) {
    console.log(
      SerieRepository.name,
      '- buscando series que irão lançar episódio hoje'
    );
    return SeriesModel.find({
      seasons: {
        $elemMatch: {
          episodes: {
            $elemMatch: {
              airdate: date,
            },
          },
        },
      },
    });
  }

  async createSeasonByName(name, season) {
    console.log(SerieRepository.name, '- criando temporada na serie');
    return SeriesModel.updateOne(
      { name },
      {
        $push: {
          seasons: season,
        },
      }
    );
  }

  async updateLastSeasonByName(name, season) {
    console.log(SerieRepository.name, '- atualizando temporada na serie');
    return SeriesModel.updateOne(
      { name },
      {
        $set: {
          'seasons.$[t].episodes': season.episodes,
        },
      },
      {
        upsert: true,
        arrayFilters: [{ 't.number': season.number }],
      }
    );
  }
}

module.exports = SerieRepository;
