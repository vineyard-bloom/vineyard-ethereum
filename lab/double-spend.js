"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
var gethNode1 = new _1.GethNode();
var gethNode2 = new _1.GethNode();
gethNode1.doubleSpend().then(function (result) { return console.log(result); });
gethNode2.doubleSpend().then(function (result) { return console.log(result); });
//# sourceMappingURL=double-spend.js.map