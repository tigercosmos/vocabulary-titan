const cheerio = require('cheerio')
const axios = require("axios");

const CambridgeError = {
  ParseError: "Cannot parse the content got from Cambridge",
  EmptyError: "No content in Cambridge",
  FetchError: "Cannot fetch the Cambridge website (probably no this word)"
}

function Cambridge(content) {
  try {
    const $ = cheerio.load(content);

    const defEg = $('.pos-body').map((i, el) => {
      const defStr = $(el).find('.def').text().replace("› ", "").replace(":", "");
      let result = `${i+1}. ${defStr}`;

      $(el).find('.eg').each((_i, el2) => {
        result += `\n   - ${$(el2).text()}`
      });

      return result;
    }).get().join('\n');

    if (defEg.length == 0) {
      throw CambridgeError.EmptyError;
    }

    const pronunciation = $('.pron').first().text();
    const result = '\nCambridge Definition:\n' + defEg;

    return {
      pronunciation,
      result
    };
  } catch (e) {
    throw CambridgeError.ParseError;
  }
}

async function FetchCambridge(text) {
  const url = `https://dictionary.cambridge.org/us/dictionary/english/${text}`;
  try {
    const res = await axios.get(url);
    const data = res.data;
    return Cambridge(data);
  } catch (e) {
    throw CambridgeError.FetchError;
  }
}

module.exports = {
  CambridgeError,
  Cambridge,
  FetchCambridge,
};