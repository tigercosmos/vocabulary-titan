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

const MAX_LENGTH = 2000;

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
    } else if (/^[a-zA-Z\s-]+$/.test(text)) {
      const word = text.trim();
      let result = "";

      if (cache.get(word) === undefined) {
        result += `Looking for: \`${word}\`\n---\n`
        // print the Cambridge dictionary's definition
        try {
          const cambridgeResult = await FetchCambridge(word);
          result += cambridgeResult.result + '\n';
        } catch (e) {
          console.log(e);
          result += `!! ${e}\n`;
        }
        try {
          const dicRes = await FetchDictionaryCom(word);

          const noDefMsg = "---\n<Skip DictionaryCom's def: len limit>";
          const noSynonymMsg = "---\n<Skip syn: len limit>";
          const noOriginMsg = "---\n<Skip origin: len limit>";

          // print the dictionary.com's definition
          if (result.length + dicRes.result.length < MAX_LENGTH - noSynonymMsg.length - noOriginMsg.length) {
            result += dicRes.result;
          } else if (result.length + noDefMsg.length < MAX_LENGTH) {
            result += noDefMsg + '\n';
          }

          // print the synonyms
          if (result.length + dicRes.synonym.length < MAX_LENGTH - noOriginMsg.length) {
            if (dicRes.synonym.length > 0) {
              result += dicRes.synonym + '\n';
            }
          } else if (result.length + noSynonymMsg.length < MAX_LENGTH) {
            result += noSynonymMsg + '\n';
          }

          // print the origin
          if (result.length + dicRes.origin.length < MAX_LENGTH) {
            result += dicRes.origin;
          } else if (result.length + noOriginMsg.length < MAX_LENGTH) {
            result += noOriginMsg;
          }
        } catch (e) {
          console.log(e);
          result += `!! ${e}\n`;
        }
        cache.set(word, result);
      } else {
        result = cache.get(word);
      }
      console.log("word:", word);
      console.log("total length: ", result.length);
      await platformReplyText(context, result);
    } else {
      await platformReplyText(context, "Wrong Input!");
    }
  }
};

module.exports = handler;