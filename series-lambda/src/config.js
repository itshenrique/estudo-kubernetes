require('dotenv').config();

const omdb = {
  apiKey: process.env.OMDB_API_KEY,
};

const atlasMongo = {
  mongoUri: process.env.MONGO_URI,
};

module.exports = {
  omdb,
  atlasMongo,
};
