require('dotenv').config();

const telegramApi = {
  token: process.env.TELEGRAM_BOT_TOKEN,
};

const atlasMongo = {
  mongoUri: process.env.MONGO_URI,
};

module.exports = {
  atlasMongo,
  telegramApi,
};
