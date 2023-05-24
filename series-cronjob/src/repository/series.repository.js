const { SeriesModel } = require('../model/series');

class SerieRepository {
  findAll() {
    console.log(SerieRepository.name, '- buscando series');
    return SeriesModel.find();
  }

  async createSeasonByName(uuid, season) {
    console.log(SerieRepository.name, '- criando temporada na serie');
    return SeriesModel.updateOne(
      { uuid },
      {
        $push: {
          seasons: season,
        },
      }
    );
  }

  async updateLastSeasonByName(uuid, season) {
    console.log(SerieRepository.name, '- atualizando temporada na serie');
    return SeriesModel.updateOne(
      { uuid },
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
