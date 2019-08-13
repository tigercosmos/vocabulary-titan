const fs = require("fs");
const {
  DictionaryCom
} = require("../lib/dictionary_com");

const content = fs.readFileSync(__dirname + "/test_data/dictionary_com-possession.html", "utf8");

const dic = DictionaryCom(content);

console.log(dic.result);