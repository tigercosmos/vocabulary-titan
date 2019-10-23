const { withProps } = require('bottender');
const { router, text } = require('bottender/router');

const cache = require('./lib/cache');
const diagnostic = require('./lib/diagnostic');
const { collectData, makeResult } = require('./lib/data_process');

async function Greeting(context) {
  const GREETING_MSG = `Hi, this is Vocabulary Titan.
Please enter a word to start to search.
Engineer: 劉安齊 Liu, An-Chi
https://tigercosmos.xyz/
Designer: 簡嘉彤 Jian, Jia-Tong
https://www.instagram.com/atong_jtj/`;

  await context.sendText(GREETING_MSG);
}

async function Diagnose(context) {
  const mem = process.memoryUsage();

  await context.sendText(`Memory used: ${mem.rss / 1000000} MB
Hit rate: ${diagnostic.hitRate}`);
}

async function HintEnterNewWord(context) {
  await context.sendText('Please enter new word.');
}

async function HandleNumber1(context, { data }) {
  await context.sendText(data.word + '\n---\n' + data.cambridge);
}

async function HandleNumber2(context, { data }) {
  const result =
    data.word +
    '\n' +
    (data.dictionary.length < 1970
      ? data.dictionary
      : data.dictionary.slice(0, 1970) + '... (too much) :p');
  await context.sendText(result);
}

async function HandleNumber3(context, { data }) {
  if (data.synonym == '') {
    await context.sendText(data.word + ': no synonym');
  } else {
    const result =
      data.word +
      '\n' +
      (data.synonym.length < 1970
        ? data.synonym
        : data.synonym.slice(0, 1970) + '... (too much) :p');
    await context.sendText(result);
  }
}

async function HandleNumber4(context, { data }) {
  const result =
    data.word +
    '\n' +
    (data.origin.length < 1970
      ? data.origin
      : data.origin.slice(0, 1970) + '... (too much) :p');
  await context.sendText(result);
}

async function HandleNumber5(context, { data }) {
  const result =
    data.word +
    '\n' +
    (data.mw_example.length < 1970
      ? data.mw_example
      : data.mw_example.slice(0, 1970) + '... (too much) :p');
  await context.sendText(result);
}

async function HandleOtherNumber(context) {
  await context.sendText('Enter number 1 to 4');
}

async function HandleNumber(context) {
  const data = cache.get(context.state.word);

  if (context.state.word == '' || data === undefined) {
    return HintEnterNewWord;
  }

  const Router = router([
    text('1', HandleNumber1),
    text('2', HandleNumber2),
    text('3', HandleNumber3),
    text('4', HandleNumber4),
    text('5', HandleNumber5),
    text('*', HandleOtherNumber),
  ]);

  return withProps(Router, { data });
}

async function SearchWord(context) {
  const { text } = context.event;

  const word = text.trim().toLowerCase();

  let result = '';

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
  context.setState({
    word,
  });

  console.log('word:', word, ', total length: ', result.length);
  const mem = process.memoryUsage();
  console.log('Memory used: %d MB', mem.rss / 1000000);
  console.log('Hit Rate: %f', diagnostic.hitRate);

  await context.sendText(result);
}

async function WrongInput(context) {
  await context.sendText('Wrong Input!');
}

module.exports = async function App(context) {
  if (context.event.isFollow || context.event.isJoin) {
    return Greeting;
  }

  return router([
    text(/^h(ello|i)|^\/start/, Greeting),
    text('@@@', Diagnose),
    text(/^\d$/, HandleNumber),
    text(/^[a-zA-Z\s-]+$/, SearchWord),
    text('*', WrongInput),
  ]);
};
