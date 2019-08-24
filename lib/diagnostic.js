const DIAGNOSTIC_KEY = Symbol("DIAGNOSTIC_KEY");

const globalSymbol = Object.getOwnPropertySymbols(global);
const hasCreated = globalSymbol.indexOf(DIAGNOSTIC_KEY) > -1;

class Diagnostic {
    constructor() {
        this.hitNum = 0;
        this.missNum = 1000;
    }

    hit() {
        if (this.hitNum < 1000) {
            this.hitNum += 1;
            this.missNum -= 1;
        }
    }

    miss() {
        if (this.missNum < 1000) {
            this.hitNum -= 1;
            this.missNum += 1;
        }
    }

    get hitRate() {
        return this.hitNum / (this.hitNum + this.missNum);
    }
}

if (!hasCreated) {
    global[DIAGNOSTIC_KEY] = new Diagnostic();
}

module.exports = global[DIAGNOSTIC_KEY]