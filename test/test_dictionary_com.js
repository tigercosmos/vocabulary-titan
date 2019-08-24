const fs = require("fs");
const {
  DictionaryCom
} = require("../lib/dictionary_com");

const content = fs.readFileSync(__dirname + "/test_data/dictionary_com-possession.html", "utf8");

const dic = DictionaryCom(content);

// console.log(dic.result);

const content2 = fs.readFileSync(__dirname + "/test_data/dictionary_com-perplexing.html", "utf8");

const dic2 = DictionaryCom(content2);

// console.log(dic2.result);

console.log("test_dictionary_com OK!");