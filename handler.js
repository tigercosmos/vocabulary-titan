const {
  FetchCambridge,
} = require("./lib/cambridge");
const {
  FetchDictionaryCom,
} = require("./lib/dictionary_com");
const {
  FetchMW
} = require('./lib/mw');
const cache = require('./lib/cache');
const diagnostic = require("./lib/diagnostic");

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
      let data = {
        word: "",
        cambridge: "",
        dictionary: "",
        mw_example: "",
        synonym: "",
        origin: "",
      };

      data.word = word;

      if (cache.get(word) === undefined) {

        diagnostic.miss();

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

module.exports = handler;