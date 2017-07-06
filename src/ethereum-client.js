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
        return Promise.resolve(this.addresses[this.index++]);
    };
    return PredefinedAddressSource;
}());
exports.PredefinedAddressSource = PredefinedAddressSource;
var MockEthereumClient = (function () {
    function MockEthereumClient(addressSource) {
        this.addressSource = addressSource;
    }
    MockEthereumClient.prototype.generateAddress = function () {
        var _this = this;
        return this.addressSource.generateAddress()
            .then(function (address) {
            _this.addresses[address] = 0;
            return Promise.resolve(address);
        });
    };
    MockEthereumClient.prototype.generatePoolAddress = function () {
        var _this = this;
        return this.addressSource.generateAddress()
            .then(function (address) {
            _this.addresses[address] = 0;
            return Promise.resolve(address);
        });
    };
    MockEthereumClient.prototype.getBalance = function (address) {
        return Promise.resolve(this.addresses[address]);
    };
    MockEthereumClient.prototype.send = function (fromAddress, toAddress, value, gasPrice) {
        if (this.addresses[fromAddress] < value)
            throw new Error('not enough funds');
        this.addresses[fromAddress] -= value;
        this.addresses[toAddress] += value;
        return Promise.resolve({});
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
    Web3EthereumClient.prototype.fromWei = function (amount) {
        return amount * 1000000000000000000;
    };
    Web3EthereumClient.prototype.generateAddress = function () {
        return Promise.resolve(web3.personal.newAccount());
    };
    Web3EthereumClient.prototype.getAccounts = function () {
        return Promise.resolve(web3.eth.accounts);
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
        web3.personal.unlockAccount(fromAddress);
        var transaction = { from: fromAddress, to: toAddress, value: web3.toWei(amount), gasPrice: 200000000 };
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
// web3.personal.sendTransaction({from: web3.personal.defaultAccount, to: web3.eth.accounts[1], amount: 100}, function(tx){console.log(tx)}) 
//# sourceMappingURL=ethereum-client.js.map