const { SeriesModel } = require('../model/series');

class SerieRepository {
  findAll() {
    console.log(SerieRepository.name, '- buscando series');
    return SeriesModel.find({
      isFinished: {
        $in: [undefined, false],
      },
    });
  }

  async updateSeasonsByUuid(uuid, isFinished, seasons) {
    console.log(SerieRepository.name, '- atualizando temporada na serie');
    return SeriesModel.updateOne(
      { uuid },
      {
        $set: {
          isFinished,
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
