const { default: axios } = require('axios');
const { messageApi } = require('../config');

module.exports = {
  sendMessageToUserViaTelegram(telegramId, message) {
    try {
      return axios.post(messageApi.url + '/send', {
        telegramId,
        message,
      });
    } catch (err) {
      console.error('axios', err);
    }
  },
};
