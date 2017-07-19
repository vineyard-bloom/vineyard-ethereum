"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Web3 = require("web3");
var web3 = new Web3();
var utility_1 = require("./utility");
var bignumber_js_1 = require("bignumber.js");
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
var RandomAddressSource = (function () {
    function RandomAddressSource() {
    }
    RandomAddressSource.prototype.generateAddress = function () {
        return Promise.resolve('fake-eth-address-' + Math.floor((Math.random() * 100000) + 1));
    };
    return RandomAddressSource;
}());
exports.RandomAddressSource = RandomAddressSource;
var MockEthereumClient = (function () {
    function MockEthereumClient(addressSource) {
        this.addresses = {};
        this.addressSource = addressSource;
    }
    MockEthereumClient.prototype.createAddress = function () {
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
    MockEthereumClient.prototype.send = function (fromAddress, toAddress, value, gas) {
        if (gas === void 0) { gas = "2100"; }
        if (new bignumber_js_1.default(this.addresses[fromAddress]).lessThan(value))
            throw new Error('not enough funds');
        this.addresses[fromAddress] = new bignumber_js_1.default(this.addresses[fromAddress]).minus(new bignumber_js_1.default(value));
        this.addresses[toAddress] = new bignumber_js_1.default(this.addresses[toAddress]).plus(new bignumber_js_1.default(value));
        return Promise.resolve({
            from: '',
            to: fromAddress,
            wei: value,
            gas: gas
        });
    };
    MockEthereumClient.prototype.listAllTransactions = function () {
        throw new Error("Not yet implemented.");
    };
    MockEthereumClient.prototype.importAddress = function (address) {
        this.addresses[address] = 0;
        return Promise.resolve();
    };
    return MockEthereumClient;
}());
exports.MockEthereumClient = MockEthereumClient;
var Web3EthereumClient = (function () {
    function Web3EthereumClient(ethereumConfig) {
        web3.setProvider(new web3.providers.HttpProvider(ethereumConfig.http));
    }
    Web3EthereumClient.prototype.getClient = function () {
        return this;
    };
    Web3EthereumClient.prototype.getCoinbase = function () {
        return Promise.resolve(web3.eth.coinbase);
    };
    Web3EthereumClient.prototype.toWei = function (amount) {
        return web3.toWei(amount);
    };
    Web3EthereumClient.prototype.fromWei = function (amount) {
        return amount * 1000000000000000000;
    };
    Web3EthereumClient.prototype.createAddress = function () {
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
    Web3EthereumClient.prototype.send = function (fromAddress, toAddress, amount, gas) {
        if (gas === void 0) { gas = "21000"; }
        if (fromAddress === '') {
            fromAddress = web3.eth.coinbase;
        }
        web3.personal.unlockAccount(fromAddress);
        amount = web3.toHex(amount);
        console.log(fromAddress, "im the from address")
        console.log(this.getBalance(fromAddress), "im the balance")
        var transaction = { from: fromAddress, to: toAddress, value: amount, gas: gas };
        return new Promise(function (resolve, reject) {
            web3.eth.sendTransaction(transaction, function (err, address) {
                if (err)
                    console.error(err);
                reject('Error sending to: ' + address);
                resolve(transaction);
            });
        });
    };
    Web3EthereumClient.prototype.listAllTransaction = function (address, lastblock) {
        return utility_1.getTransactionsByAccount(web3.eth, address, lastblock);
    };
    Web3EthereumClient.prototype.importAddress = function (address) {
        throw new Error("Not implemented");
    };
    return Web3EthereumClient;
}());
exports.Web3EthereumClient = Web3EthereumClient;
//# sourceMappingURL=ethereum-client.js.map