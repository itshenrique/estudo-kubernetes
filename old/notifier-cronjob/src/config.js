require('dotenv').config();

const messageApi = {
  url: process.env.MESSAGE_API_URL,
};

const atlasMongo = {
  mongoUri: process.env.MONGO_URI,
};

module.exports = {
  messageApi,
  atlasMongo,
};
