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
    // remove disturbing dom
    $('.dataset').remove(); 
    $('.runon').remove();

    const defEg = $('.entry-body__el').map((i, el) => {
      const part = $(el).find('.pos-header').find('.pos').first().text();
      const defStr = $(el).find('.pos-body').find('.def').text().replace("› ", "").replace(":", "");
      let result = `${i+1}. ${part}. ${defStr}`;

      // examples
      $(el).find('.eg').each((_i, el2) => {
        result += `\n   - ${$(el2).text()}`
      });

      return result;
    }).get().join('\n');

    if (defEg.length == 0) {
      throw CambridgeError.EmptyError;
    }

    const word = $('.pos-header').find('.hw').first().text();
    const pronunciation = $('.pron').first().text();
    const result = `\`✓ Cambridge Definition:\`\n${word} ${pronunciation}\n` + defEg;

    return {
      word,
      pronunciation,
      result
    };
  } catch (e) {
    console.log(e);
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