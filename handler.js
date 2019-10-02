const cache = require('./lib/cache');
const diagnostic = require("./lib/diagnostic");
const {
  collectData,
  makeResult
} = require("./lib/data_process");

async function platformReplyText(context, message) {
  if (context.platform == 'line') {
    await context.replyText(message);
  } else if (context.platform == "telegram") {
    await context.sendMessage(message);
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
    if (/^h(ello|i)|^\/start/i.test(text)) {
      await platformReplyText(context, greetingMsg);
    } else if (text == "@@@") {
      const mem = process.memoryUsage();
      const report = "" +
        `Memory used: ${mem.rss / 1000000} MB\n` +
        `Hit rate: ${diagnostic.hitRate}`;
      await platformReplyText(context, report);
    } else if (/^\d$/.test(text)) {
      const data = cache.get(context.state.word);
      if (context.state.word == "" || data === undefined) {
        await platformReplyText(context, "Please enter new word.");
      } else {
        switch (text) {
          case "1":
            await platformReplyText(context, data.word + '\n---\n' + data.cambridge);
            break;
          case "2":
            const result2 = data.word + '\n' + (data.dictionary.length < 1970 ? data.dictionary : data.dictionary.slice(0, 1970) + "... (too much) :p");
            await platformReplyText(context, result2);
            break;
          case "3":
            if (data.synonym == "") {
              await platformReplyText(context, data.word + ": no synonym");
            } else {
              const result3 = data.word + '\n' + (data.synonym.length < 1970 ? data.synonym : data.synonym.slice(0, 1970) + "... (too much) :p");
              await platformReplyText(context, result3);
            }
            break;
          case "4":
            const result4 = data.word + '\n' + (data.origin.length < 1970 ? data.origin : data.origin.slice(0, 1970) + "... (too much) :p");
            await platformReplyText(context, result4);
            break;
          case "5":
            const result5 = data.word + '\n' + (data.mw_example.length < 1970 ? data.mw_example : data.mw_example.slice(0, 1970) + "... (too much) :p");
            await platformReplyText(context, result5);
            break;
          default:
            await platformReplyText(context, "Enter number 1 to 4");
            break;
        }
      }

    } else if (/^[a-zA-Z\s-]+$/.test(text)) {
      const word = text.trim().toLowerCase();

      let result = "";

      if (cache.get(word) === undefined) {

        diagnostic.miss();

        const data = await collectData(word);

        cache.set(word, data);
        result = makeResult(data);
      } else {
        diagnostic.hit();
        result = makeResult(cache.get(word));
      }
      // store in session
      context.state.word = word;

      console.log("word:", word, ", total length: ", result.length);
      const mem = process.memoryUsage();
      console.log("Memory used: %d MB", mem.rss / 1000000);
      console.log("Hit Rate: %f", diagnostic.hitRate);

      await platformReplyText(context, result);
    } else {
      await platformReplyText(context, "Wrong Input!");
    }
  }
};

module.exports = handler;