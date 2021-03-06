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

    let example_limit = 3; // avoid too much examples

    function getDefEg(example_limit) {
      const defEg = $('.entry-body__el').map((i, el) => {
        const part = $(el).find('.pos-header').find('.pos').first().text();
        const defStr = $(el).find('.pos-body').find('.def').text().replace("› ", "").replace(":", "");
        let result = `${i+1}. ${part}. ${defStr}`;

        // examples
        $(el).find('.eg').each((i, el2) => {
          if (i < example_limit) {
            result += `\n   - ${$(el2).text()}`
          }
        });

        return result;
      }).get().join('\n');
      return defEg;
    }

    const word = $('.pos-header').find('.hw').first().text();
    const pronunciation = $('.pron').first().text();
    let result = "";

    while (example_limit-- && example_limit >= 0) {
      const defEg = getDefEg(example_limit);
      if (defEg.length == 0) {
        throw CambridgeError.EmptyError;
      }
      result = `✓ Cambridge Definition:\n${word} ${pronunciation}\n` + defEg;

      if (result.length < 1900) {
        return {
          word,
          pronunciation,
          result
        };
      }
    }
    return {
      result: result.slice(0, 1900) + "... (too much) :P"
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