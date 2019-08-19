const {
  FetchCambridge,
} = require("./lib/cambridge");
const {
  FetchDictionaryCom,
} = require("./lib/dictionary_com");

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
    } else {
      let result = `Looking for: \`${text.trim()}\`\n`;
      // print the Cambridge dictionary's definition
      try {
        const cambridgeResult = await FetchCambridge(text);
        result += cambridgeResult.result + '\n\n';
      } catch (e) {
        result += `!! ${e}\n`;
      }
      try {
        const dicRes = await FetchDictionaryCom(text);

        const noDefMsg = "\`<Skip DictionaryCom's def: len limit>\`";
        const noSynonymMsg = "\`<Skip syn: len limit>\`";
        const noOriginMsg = "\`<Skip origin: len limit>\`";

        // print the dictionary.com's definition
        if (result.length + dicRes.result.length < 2000 - noSynonymMsg.length - noOriginMsg.length) {
          result += dicRes.result;
        } else {
          result += noDefMsg + '\n';
        }
        // print the synonyms
        if (result.length + dicRes.synonym.length < 2000 - noOriginMsg.length) {
          if (dicRes.synonym.length > 0) {
            result += dicRes.synonym + '\n';
          }
        } else {
          result += noSynonymMsg + '\n';
        }
        // print the origin
        if (result.length + dicRes.origin.length < 2000) {
          result += dicRes.origin;
        } else {
          result += noOriginMsg;
        }
      } catch (e) {
        result += `!! ${e}\n`;
      }
      console.log("word:", text.trim());
      console.log("total length: ", result.length);
      await platformReplyText(context, result);
    }
  }
};

module.exports = handler;