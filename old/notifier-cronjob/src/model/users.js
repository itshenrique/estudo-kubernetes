const { Schema, default: mongoose } = require('mongoose');

const UsersModel = mongoose.model(
  'users',
  new Schema({
    uuid: { type: String, unique: true, index: true },
    telegramId: { type: Number, unique: true, index: true },
    seriesUuid: [{ type: String }],
  })
);

module.exports = { UsersModel };
