const { UsersModel } = require('../model/users');

class UserRepository {
  findBySeriesUuid(seriesUuid) {
    console.log(
      UserRepository.name,
      '- buscando usuários que inscritos em séries com episódios à lançar'
    );
    return UsersModel.find({
      seriesUuid: {
        $in: seriesUuid,
      },
    });
  }
}

module.exports = UserRepository;
