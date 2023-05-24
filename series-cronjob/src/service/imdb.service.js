const axios = require('axios');
const jsdom = require('jsdom');

async function getLastSeasonInfo(id) {
  const { JSDOM } = jsdom;
  const response = await axios.get(`https://www.imdb.com/title/${id}/episodes`);
  const dom = new JSDOM(response.data);
  const seasonNumber = await dom.window.document
    .querySelector('#bySeason [selected="selected"]')
    .textContent.replace(/(\r\n|\n|\r)/gm, '')
    .trim();
  const episodes = [
    ...dom.window.document.querySelectorAll('div .airdate'),
  ].map((el, index) => ({
    number: index + 1,
    airdate: new Date(`${el.textContent}`.replace(/(\r\n|\n|\r)/gm, '').trim()),
  }));

  return {
    number: seasonNumber,
    episodes,
  };
}
module.exports = {
  getLastSeasonInfo,
};
