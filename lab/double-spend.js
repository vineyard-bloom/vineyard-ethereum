"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
function fund(node) {
    var web3 = node.getWeb3();
    return new Promise(function (resolve, reject) {
        console.log(web3.eth.getBalance(web3.eth.coinbase), "coinbase balance");
        var send = function () {
            web3.personal.unlockAccount(web3.eth.coinbase);
            web3.eth.sendTransaction({
                from: web3.eth.coinbase,
                to: web3.eth.accounts[1],
                value: web3.toWei(8)
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
        setTimeout(send, 1000);
    })
        .then(function (result) { return console.log(web3.eth.getTransaction(result)); });
}
function spend(node, miner) {
    var web3 = node.getWeb3();
    return new Promise(function (resolve, reject) {
        _1.mine(miner, 8547, 30000);
        var send = function () {
            console.log(web3.eth.getBalance(web3.eth.accounts[1]), "account 1 balance");
            web3.personal.unlockAccount(web3.eth.accounts[1]);
            web3.eth.sendTransaction({
                from: web3.eth.accounts[1],
                to: web3.eth.accounts[2],
                value: web3.toWei(5)
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
        setTimeout(send, 15000);
    })
        .then(function (result) { return console.log(web3.eth.getTransaction(result)); });
}
function doubleSpend(config) {
    var node1 = new _1.GethNode(config);
    var node2 = new _1.GethNode(config);
    _1.mine(node1, 8546, 30000).then(function () { return node1.start(8546).then(function () { return fund(node1); }).then(function () { return spend(node1, node2); })
        .then(function () { return node2.start(8546); })
        .then(function () { return fund(node2); }).then(function () { return spend(node2); }); });
}
exports.doubleSpend = doubleSpend;
//# sourceMappingURL=double-spend.js.map