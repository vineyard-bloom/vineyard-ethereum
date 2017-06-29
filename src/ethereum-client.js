"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var Web3EthereumClient = (function () {
    function Web3EthereumClient(ethereumConfig) {
        web3.setProvider(new web3.providers.HttpProvider(ethereumConfig.http));
    }
    Web3EthereumClient.prototype.getClient = function () {
        return this.client;
    };
    Web3EthereumClient.prototype.toWei = function (amount) {
        return web3.toWei(amount);
    };
    Web3EthereumClient.prototype.generateAddress = function () {
        return web3.eth.newAccount();
    };
    Web3EthereumClient.prototype.getBalance = function (address) {
        return new Promise(function (resolve, reject) {
            web3.eth.getBalance(address, function (err, result) {
                if (err)
                    resolve(err);
                resolve(result);
            });
        });
    };
    Web3EthereumClient.prototype.send = function (fromAddress, toAddress, amount) {
        var transaction = { from: fromAddress, to: toAddress, amount: web3.toWei(amount) };
        return new Promise(function (resolve, reject) {
            web3.eth.sendTransaction(transaction, function (err, address) {
                if (err)
                    resolve('Error sending to: ' + address);
                resolve(transaction);
            });
        });
    };
    return Web3EthereumClient;
}());
exports.Web3EthereumClient = Web3EthereumClient;
//# sourceMappingURL=ethereum-client.js.map