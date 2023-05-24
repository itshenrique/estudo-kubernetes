const mongoose = require('mongoose');
const { atlasMongo } = require('../config');

class MongoDb {
  mongoConnection = null;

  constructor() {
    return this.getConnection();
  }

  getConnection() {
    mongoose.set('debug', true);

    if (this.mongoConnection) return this.mongoConnection;

    return mongoose.connect(atlasMongo.mongoUri);
  }
}

module.exports = MongoDb;
