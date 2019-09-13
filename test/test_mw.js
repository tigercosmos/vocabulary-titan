const fs = require("fs");
const {
  MW,
} = require("../lib/mw");

const content = fs.readFileSync(__dirname + "/test_data/mw-complete.html");

const result = MW(content);

// console.log(result.example);

console.log("test_mw OK!");