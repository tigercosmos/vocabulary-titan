const dia = require("../lib/diagnostic");
const assert = require('assert');

for (let i = 0; i < 500; i++) {
    dia.hit();
}

assert.equal(dia.hitRate, 0.500, "from 0 to 0.5");

for (let i = 0; i < 800; i++) {
    dia.hit();
}

assert.equal(dia.hitRate, 1.000, "should still 1.0");

for (let i = 0; i < 500; i++) {
    dia.miss();
}

assert.equal(dia.hitRate, 0.5, "decrease to 0.5");

for (let i = 0; i < 700; i++) {
    dia.miss();
}

assert.equal(dia.hitRate, 0.0, "should keep as 0");

console.log("test_diagnostic OK!");