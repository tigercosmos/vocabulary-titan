const cheerio = require('cheerio')
const axios = require("axios");

const MWError = {
  ParseError: "Cannot parse the content got from merriam-webster",
  EmptyError: "No content in merriam-webster",
  FetchError: "Cannot fetch the merriam-webster website (probably no this word)"
}

function MW(content) {
  try {
    const $ = cheerio.load(content);

    const examples = $('.in-sentences').map(function (_i, el) {
      const sents = $(el).find('span').map(function (_j, el2) {
        return ` ${$(el2).text().replace(/\s\s/g, "")}`;
      }).get().join("\n");

      return `${sents}`;
    }).get().join("\n");

    return {
      example: `---\n✓ Merriam-Webster Example:\n${examples}\n`,
    };
  } catch (e) {
    console.log(e);
    throw MWError.ParseError;
  }
}

async function FetchMW(text) {
  const url = `https://www.merriam-webster.com/dictionary/${text}`;
  try {
    const res = await axios.get(url);
    const data = res.data;
    return MW(data);
  } catch (e) {
    throw MWError.FetchError;
  }
}

module.exports = {
  MWError,
  MW,
  FetchMW,
};