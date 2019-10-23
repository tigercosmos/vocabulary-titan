const { initializeServer } = require('bottender');
const minimist = require('minimist');

const { collectData } = require('./lib/data_process');

const argv = minimist(process.argv.slice(2));

const isConsole = argv.console;

if (isConsole) {
  initializeServer({ isConsole });
} else {
  const server = initializeServer();

  server.get('/api/:word', (req, res) => {
    const word = req.params.word;

    (async () => {
      const data = await collectData(word);
      return res.json(data);
    })();
  });

  const port = process.env.PORT || 8080;
  server.listen(port, () => {
    console.log(`server is listening on ${port} port...`);
  });
}
