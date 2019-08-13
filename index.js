const {
  ConsoleBot,
  // MessengerBot,
  LineBot,
  // TelegramBot,
} = require('bottender');

const handler = require('./handler');
const config = require('./config');

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
    line: new LineBot(config.line).onEvent(handler),
    // telegram: new TelegramBot(config.telegram).onEvent(handler),
  };

  // registerRoutes(server, bots.messenger, {
  //   path: '/messenger',
  //   verifyToken: config.messenger.verifyToken,
  // });
  registerRoutes(server, bots.line, {
    path: '/line'
  });
  // registerRoutes(server, bots.telegram, { path: '/telegram' });

  const port = process.env.PORT || 8080;
  server.listen(port, () => {
    console.log(`server is listening on ${port} port...`);
    console.log(`config: `, config);
  });
}