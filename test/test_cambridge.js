const fs = require("fs");
const {
  Cambridge,
  CambridgeError
} = require("../lib/cambridge");

const content = fs.readFileSync(__dirname + "/test_data/cambridge-august.html");

const result = Cambridge(content);

console.log(result);