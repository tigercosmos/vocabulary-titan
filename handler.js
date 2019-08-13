const {
  FetchCambridge,
  CambridgeError
} = require("./lib/cambridge");

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
      let result = ""
      try {
        const cambridgeResult = await FetchCambridge(text);
        result += `【${text} ${cambridgeResult.pronunciation}】`;
        result += cambridgeResult.result;
      } catch (e) {
        await context.sendText(e);
      }
      await context.sendText(result);
    }
  }
};

module.exports = handler;