const {
  FetchCambridge,
} = require("./lib/cambridge");
const {
  FetchDictionaryCom,
} = require("./lib/dictionary_com");

const handler = async context => {
  if (context.event.isFollow) {
    await context.sendText("Hi! Enter a word to start...");
  } else if (context.event.isJoin) {
    await context.sendText("Hi! Enter a word to start...");
  } else if (context.event.isText) {
    const {
      text
    } = context.event.message;
    if (/^h(ello|i)/i.test(text)) {
      await context.sendText('Hi there!');
    } else {
      let result = `Looking for: \`${text.trim()}\`\n`;
      try {
        const cambridgeResult = await FetchCambridge(text);
        result += cambridgeResult.result;
      } catch (e) {
        result += `!! ${e}\n`;
      }
      result += '\n';
      try {
        const dicRes = await FetchDictionaryCom(text);

        const noDefMsg = "\n<Skip dictionary.com's definition due to length limit>";
        const noSynonymMsg = "\n<Skip synonyms due to length limit>";
        const noOriginMsg = "\n<Skip origin due to length limit>";

        if (result.length + dicRes.result.length < 2000 - noSynonymMsg.length) {
          result += dicRes.result;
        } else {
          result += noDefMsg;
        }
        if (result.length + dicRes.synonym.length < 2000 - noOriginMsg.length) {
          result += dicRes.synonym;
        } else {
          result += noSynonymMsg;
        }
        if (result.length + dicRes.origin.length < 2000) {
          result += dicRes.origin;
        } else {
          result += noOriginMsg;
        }
      } catch (e) {
        result += `!! ${e}\n`;
      }
      console.log("total length: ", result.length);
      await context.sendText(result);
    }
  }
};

module.exports = handler;