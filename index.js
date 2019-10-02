const {
  ConsoleBot,
  // MessengerBot,
  LineBot,
  TelegramBot,
  MemorySessionStore,
} = require('bottender');

const handler = require('./handler');
const config = require('./config');

// Memory session
const MAX_ITEMS_IN_CACHE = 1000; // connection number
const EXPIRED_IN_MINUTE = 10; // 10 min
const mSession = new MemorySessionStore(MAX_ITEMS_IN_CACHE, EXPIRED_IN_MINUTE);

const sessData = {
  word: "",
};

if (process.env.USE_CONSOLE === 'true') {
  const bot = new ConsoleBot().onEvent(handler);
  bot.createRuntime();
} else {
  const express = require('express');
  const bodyParser = require('body-parser');

  const {
    registerRoutes
  } = require('bottender/express');

  const server = express();

  server.use(
    bodyParser.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf.toString();
      },
    })
  );

  const bots = {
    // messenger: new MessengerBot(config.messenger).onEvent(handler),
    line: new LineBot({
        channelSecret: config.line.channelSecret,
        accessToken: config.line.accessToken,
        sessionStore: mSession,
      })
      .setInitialState(sessData)
      .onEvent(handler),
    telegram: new TelegramBot({
        accessToken: config.telegram.accessToken,
        sessionStore: mSession,
      })
      .setInitialState(sessData)
      .onEvent(handler),
  };

  // registerRoutes(server, bots.messenger, {
  //   path: '/messenger',
  //   verifyToken: config.messenger.verifyToken,
  // });
  registerRoutes(server, bots.line, {
    path: '/line'
  });
  registerRoutes(server, bots.telegram, {
    path: '/telegram'
  });

  server.get('/api/:word', (req, res) => {

    const word = req.params.word;

    const {
      collectData
    } = require("./lib/data_process");

    (async () => {
      const data = await collectData(word)
      return res.json(data);
    })();
  })

  const port = process.env.PORT || 8080;
  server.listen(port, () => {
    console.log(`server is listening on ${port} port...`);
    console.log(`config: `, config);
  });
}