const {
  FetchCambridge,
  CambridgeError
} = require("./lib/cambridge");

const handler = async context => {
  if (context.event.isText) {
    const {
      text
    } = context.event.message;
    if (/^h(ello|i)/i.test(text)) {
      await context.sendText('Hi there!');
    } else {
      let result = ""
      try {
        const cambridgeResult = await FetchCambridge(text);
        result += cambridgeResult;
      } catch (e) {
        await context.sendText(e);
      }
      await context.sendText(result);
    }
  }
};

module.exports = handler;