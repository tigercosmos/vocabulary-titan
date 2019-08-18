const {
  FetchCambridge,
} = require("./lib/cambridge");
const {
  FetchDictionaryCom,
} = require("./lib/dictionary_com");

const handler = async context => {
  if (context.event.isFollow) {
    await context.replyText("Hi! Enter a word to start...");
  } else if (context.event.isJoin) {
    await context.replyText("Hi! Enter a word to start...");
  } else if (context.event.isText) {
    const {
      text
    } = context.event.message;
    if (/^h(ello|i)/i.test(text)) {
      await context.replyText('Hi there!');
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

        const noDefMsg = "\`<Skip DictionaryCom's definition due to length limit>\`";
        const noSynonymMsg = "\`<Skip synonyms due to length limit>\`";
        const noOriginMsg = "\`<Skip origin due to length limit>\`";

        // print the dictionary.com's definition
        if (result.length + dicRes.result.length < 2000 - noSynonymMsg.length) {
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
      console.log("total length: ", result.length);
      await context.replyText(result);
    }
  }
};

module.exports = handler;