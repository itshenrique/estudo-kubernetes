const axios = require('axios');
const { omdb } = require('../config');

async function getSerieInfoByImdbKey(imdbId) {
  const response = await axios.get(`https://www.omdbapi.com/`, {
    params: {
      apikey: omdb.apiKey,
      i: imdbId,
      type: 'series',
    },
  });
  return response.data;
}

module.exports = {
  getSerieInfoByImdbKey,
};
