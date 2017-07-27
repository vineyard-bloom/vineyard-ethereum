"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
function spend(node) {
    return new Promise(function (resolve, reject) {
        var send = function () {
            console.log(node.eth.getBalance(node.eth.coinbase).toNumber(), "I AM THE COINBASE BALANCE");
            node.personal.unlockAccount(node.eth.coinbase);
            node.eth.sendTransaction({
                from: node.eth.coinbase,
                to: node.eth.accounts[1],
                value: node.toWei(35)
            }, function (err, tx) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    console.log(tx);
                    resolve(tx);
                }
            });
        };
        setTimeout(send, 10000);
    })
        .then(function (result) { return console.log(result); });
}
function doubleSpend() {
    var node1 = new _1.GethNode();
    var node2 = new _1.GethNode();
    return spend(node1)
        .then(function () { return spend(node2); });
}
exports.doubleSpend = doubleSpend;
//# sourceMappingURL=double-spend.js.map