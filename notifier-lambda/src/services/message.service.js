const TelegramBot = require('node-telegram-bot-api');
const { telegramApi } = require('../config');

class MessageService {
  telegramBot;

  constructor() {
    this.telegramBot = new TelegramBot(telegramApi.token, { polling: false });
  }

  async sendMessageToUser(telegramId, message) {
    return this.telegramBot.sendMessage(telegramId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    });
  }
}

module.exports = MessageService;
