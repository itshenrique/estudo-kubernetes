const { SeriesModel } = require('../model/series');

class SerieRepository {
  findAll() {
    console.log(SerieRepository.name, '- buscando series');
    return SeriesModel.find();
  }

  async updateSeasonsByUuid(uuid, seasons) {
    console.log(SerieRepository.name, '- atualizando temporada na serie');
    return SeriesModel.updateOne(
      { uuid },
      {
        $set: {
          seasons,
        },
      },
      {
        upsert: true,
      }
    );
  }
}

module.exports = SerieRepository;
