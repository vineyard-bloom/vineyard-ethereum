"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var PredefinedAddressSource = (function () {
    function PredefinedAddressSource(addresses) {
        this.index = 0;
        this.addresses = addresses;
    }
    PredefinedAddressSource.prototype.generateAddress = function () {
        return Promise.resolve(this.address[this.index++]);
    };
    return PredefinedAddressSource;
}());
exports.PredefinedAddressSource = PredefinedAddressSource;
var MockEthereumClient = (function () {
    function MockEthereumClient(addressSource) {
        this.addressSource = addressSource;
    }
    MockEthereumClient.prototype.generateAddress = function () {
        var address = this.addressSource.generateAddress();
        this.address[address] = 0;
        return Promise.resolve(address);
    };
    MockEthereumClient.prototype.getBalance = function (address) {
        return Promise.resolve(this.addresses[address]);
    };
    MockEthereumClient.prototype.send = function (fromAddress, toAddress, amount) {
        if (this.fromAddress -= amount) {
            throw new Error('not enough funds');
        }
        this.addresses[fromAddress] -= amount;
        this.addresses[toAddress] += amount;
        return Promise.resolve(new EthereumTransaction());
    };
    return MockEthereumClient;
}());
exports.MockEthereumClient = MockEthereumClient;
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