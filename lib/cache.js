const LRU = require("lru-cache");

const CACHE_KEY = Symbol("LRU_Cache");

const globalSymbol = Object.getOwnPropertySymbols(global);
const hasCreated = globalSymbol.indexOf(CACHE_KEY) > -1;

if (!hasCreated) {
  global[CACHE_KEY] = new LRU({
    max: 10000,
    length: function (n, key) {
      return n * 2 + key.length
    },
    dispose: function (key, n) {
      n.close()
    },
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
}

module.exports = global[CACHE_KEY];