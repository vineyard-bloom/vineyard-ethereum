"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
function spend(node) {
    var web3 = node.getWeb3();
    return new Promise(function (resolve, reject) {
        var send = function () {
            console.log(web3.eth.getBalance(web3.eth.coinbase).toNumber(), "I AM THE COINBASE BALANCE");
            web3.personal.unlockAccount(web3.eth.coinbase);
            web3.eth.sendTransaction({
                from: web3.eth.coinbase,
                to: web3.eth.accounts[1],
                value: web3.toWei(35)
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
        .then(function (result) { return console.log(web3.eth.getTransaction(result)); });
}
function doubleSpend() {
    var node1 = new _1.GethNode();
    var node2 = new _1.GethNode();
    node1.startMiner(8456);
    return node1.start(8546).then(function () { return spend(node1); })
        .then(function () { return node2.start(8547).then(function () { return spend(node2); }); });
}
exports.doubleSpend = doubleSpend;
//# sourceMappingURL=double-spend.js.map