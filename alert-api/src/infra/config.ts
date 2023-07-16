import * as dotenv from 'dotenv';
dotenv.config();

export const telegramApi = {
  token: process.env.TELEGRAM_BOT_TOKEN,
  telegramUserId: process.env.TELEGRAM_USER_ID,
};

export const atlasMongo = {
  mongoUri: process.env.MONGO_URI,
  mongoConnectionIdentifier: 'connection1',
};
