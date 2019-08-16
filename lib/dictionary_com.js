const cheerio = require('cheerio')
const axios = require("axios");

const DictionaryComError = {
  ParseError: "Cannot parse the content got from Dictionary.com",
  EmptyError: "No content in Dictionary.com",
  FetchError: "Cannot fetch the Dictionary.com website (probably no this word)"
}

function DictionaryCom(content) {
  try {
    const c = content.split("British Dictionary")[0]; // remove duplicate parts
    const $ = cheerio.load(c);

    let counter = 1;
    const result = $('div').map(function (_i, el) {
      if ($(el).attr('value') !== undefined && Number($(el).attr('value')) !== NaN) {
        return `${counter++}. ${$(el).text().trim()}\n`;
      }
    }).get().join("");

    const word = $('h1').first().text();
    const pron = $('.pron-spell-content').text();
    const origin = $('#wordOrigin').next().text();

    return {
      result: `\`✓ DictionaryCom Definition:\`\n${word} ${pron}\n${result}\nORIGIN: ${origin}`
    };
  } catch (e) {
    console.log(e);
    throw DictionaryComError.ParseError;
  }
}

async function FetchDictionaryCom(text) {
  const url = `https://www.dictionary.com/browse/${text}`;
  try {
    const res = await axios.get(url);
    const data = res.data;
    return DictionaryCom(data);
  } catch (e) {
    throw DictionaryComError.FetchError;
  }
}

module.exports = {
  DictionaryComError,
  DictionaryCom,
  FetchDictionaryCom,
};