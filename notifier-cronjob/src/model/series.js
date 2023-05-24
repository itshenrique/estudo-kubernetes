const { Schema, default: mongoose } = require('mongoose');

const SeriesModel = mongoose.model(
  'series',
  new Schema({
    uuid: { type: String, unique: true, index: true },
    name: { type: String, unique: true, index: true },
    seasons: [
      {
        number: { type: Number },
        episodes: [
          {
            number: { type: Number },
            airdate: { type: Date },
          },
        ],
      },
    ],
  })
);

module.exports = {
  SeriesModel,
};
