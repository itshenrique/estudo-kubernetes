import * as dotenv from 'dotenv';
dotenv.config();

export const telegramApi = {
  token: process.env.TELEGRAM_BOT_TOKEN,
};

export const omdb = {
  apiKey: process.env.OMDB_API_KEY,
};

export const atlasMongo = {
  mongoUri: process.env.MONGO_URI,
  mongoConnectionIdentifier: 'connection1',
};
