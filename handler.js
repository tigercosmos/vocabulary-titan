const {
  FetchCambridge,
} = require("./lib/cambridge");
const {
  FetchDictionaryCom,
} = require("./lib/dictionary_com");
const cache = require('./lib/cache');

async function platformReplyText(context, message) {
  if (context.platform == 'line') {
    await context.replyText(message);
  } else {
    await context.sendText(message);
  }
}


const handler = async context => {

  const greetingMsg = "Hi, this is Vocabulary Titan.\n" +
    "Please enter a word to start to search.\n\n" +
    "Engineer: 劉安齊 Liu, An-Chi\n" +
    "https://tigercosmos.xyz/ \n" +
    "Designer: 簡嘉彤 Jian, Jia-Tong\n" +
    "https://www.instagram.com/atong_jtj/ \n";

  if (context.event.isFollow) {
    await platformReplyText(context, greetingMsg);
  } else if (context.event.isJoin) {
    await platformReplyText(context, greetingMsg);
  } else if (context.event.isText) {
    const {
      text
    } = context.event.message;
    if (/^h(ello|i)/i.test(text)) {
      await platformReplyText(context, greetingMsg);
    } else if (/^\d$/.test(text)) {

    } else if (/^[a-zA-Z\s-]+$/.test(text)) {
      const word = text.trim().toLowerCase();

      let result = "";
      let data = {
        word: "",
        cambridge: "",
        dictionary: "",
        synonym: "",
        origin: "",
      };

      data.word = word;

      if (cache.get(word) === undefined) {
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
          result += `!! ${e}\n`;
        }
        cache.set(word, data);
        result = makeResult(data);
      } else {
        result = makeResult(cache.get(word));
      }
      console.log("word:", word);
      console.log("total length: ", result.length);
      await platformReplyText(context, result);
    } else {
      await platformReplyText(context, "Wrong Input!");
    }
  }
};

function makeResult(data) {
  const MAX_LENGTH = 2000;

  const noDefMsg = "---\n<Len limit: enter \"2\" to check Dic's def>";
  const noSynonymMsg = "---\n<Len limit: enter \"3\" to check syn>";
  const noOriginMsg = "---\n<Len limit: enter \"4\" to check origin>";

  let result = `Looking for: \`${data.word}\`\n---\n`
  // print the Cambridge dictionary's definition
  result += data.cambridge + '\n';

  // print the dictionary.com's definition
  if (result.length + data.dictionary.length < MAX_LENGTH - noSynonymMsg.length - noOriginMsg.length) {
    result += data.dictionary;
  } else if (result.length + noDefMsg.length < MAX_LENGTH) {
    result += noDefMsg + '\n';
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

module.exports = handler;