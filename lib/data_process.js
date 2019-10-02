const {
  FetchCambridge,
} = require("./cambridge");
const {
  FetchDictionaryCom,
} = require("./dictionary_com");
const {
  FetchMW
} = require('./mw');

async function collectData(word) {
  let data = {
    word: "",
    cambridge: "",
    dictionary: "",
    mw_example: "",
    synonym: "",
    origin: "",
  };

  data.word = word;

  try {
    const cambridgeResult = await FetchCambridge(word);
    data.cambridge = cambridgeResult.result;
  } catch (e) {
    console.log(e);
    data.cambridge = `!! ${e}\n`;
  }

  try {
    const dicRes = await FetchDictionaryCom(word);
    data.dictionary = dicRes.result;
    data.synonym = dicRes.synonym;
    data.origin = dicRes.origin;
  } catch (e) {
    console.log(e);
    data.dictionary = `!! ${e}\n`;
  }

  try {
    const mw = await FetchMW(word);
    data.mw_example = mw.example;
  } catch (e) {
    console.log(e);
    data.mw_example = "";
  }

  return data;
}

function makeResult(data) {
  const MAX_LENGTH = 2000;

  const noDefMsg = "---\n<Enter number \"2\" to check Dic's def>";
  const noSynonymMsg = "---\n<Enter number \"3\" to check synonym>";
  const noOriginMsg = "---\n<Enter number \"4\" to check origin>";
  const noMWMsg = "---\n<Enter number \"5\" to check M-W examples>";

  let result = `Looking for: \`${data.word}\`\n---\n`
  // print the Cambridge dictionary's definition
  result += data.cambridge + '\n';

  // print the dictionary.com's definition
  if (result.length + data.dictionary.length < MAX_LENGTH - noMWMsg.length - noSynonymMsg.length - noOriginMsg.length) {
    result += data.dictionary;
  } else if (result.length + noDefMsg.length < MAX_LENGTH) {
    result += noDefMsg + '\n';
  }

  // print the M-W's examples
  if (result.length + data.mw_example.length < MAX_LENGTH - noSynonymMsg.length - noOriginMsg.length) {
    result += data.mw_example;
  } else if (result.length + noMWMsg.length < MAX_LENGTH) {
    result += noMWMsg + '\n';
  }

  // print the synonyms
  if (result.length + data.synonym.length < MAX_LENGTH - noOriginMsg.length) {
    if (data.synonym.length > 0) {
      result += data.synonym + '\n';
    }
  } else if (result.length + noSynonymMsg.length < MAX_LENGTH) {
    result += noSynonymMsg + '\n';
  }

  // print the origin
  if (result.length + data.origin.length < MAX_LENGTH) {
    result += data.origin;
  } else if (result.length + noOriginMsg.length < MAX_LENGTH) {
    result += noOriginMsg;
  }

  return result;
}

module.exports = {
  collectData,
  makeResult
};