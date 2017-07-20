"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
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
        this.blocks = [];
        this.addressSource = addressSource;
        this.blocks.push({
            id: '0',
            transactions: []
        });
    }
    MockEthereumClient.prototype.createAddress = function () {
        var _this = this;
        return this.addressSource.generateAddress()
            .then(function (address) {
            _this.addresses[address] = new bignumber_js_1.default(0);
            return Promise.resolve(address);
        });
    };
    MockEthereumClient.prototype.getActiveBlock = function () {
        return this.blocks[this.blocks.length - 1];
    };
    MockEthereumClient.prototype.minePreviousBlock = function (block) {
        var reward = block.transactions.reduce(function (a, b) { return a + b.gas; }, new bignumber_js_1.default(0))
            + this.toWei(5);
        this.addresses[''] += reward;
    };
    MockEthereumClient.prototype.generate = function (blockCount) {
        for (var i = 0; i < blockCount; ++i) {
            this.minePreviousBlock(this.getActiveBlock());
            this.blocks.push({
                id: this.blocks.length.toString(),
                transactions: []
            });
        }
        return Promise.resolve();
    };
    MockEthereumClient.prototype.getBalance = function (address) {
        return Promise.resolve(this.addresses[address]);
    };
    MockEthereumClient.prototype.send = function (fromAddress, toAddress, value, gas) {
        if (gas === void 0) { gas = "2100"; }
        var fromBalance = new bignumber_js_1.default(this.addresses[fromAddress]);
        if (fromBalance.lessThan(new bignumber_js_1.default(value) + new bignumber_js_1.default(gas)))
            throw new Error('not enough funds');
        var toBalance = new bignumber_js_1.default(this.addresses[toAddress]);
        this.addresses[fromAddress] = fromBalance.minus(new bignumber_js_1.default(value));
        this.addresses[toAddress] = toBalance.plus(new bignumber_js_1.default(value));
        var transaction = {
            from: fromAddress,
            to: toAddress,
            wei: value,
            gas: gas
        };
        this.getActiveBlock().transactions.push(transaction);
        return Promise.resolve(transaction);
    };
    MockEthereumClient.prototype.listAllTransactions = function (address, lastblock) {
        var result = [];
        for (var i = lastblock; i < this.blocks.length - 1; ++i) {
            var block = this.blocks[i];
            result = result.concat(block.transactions.filter(function (t) { return t.to == address; }));
        }
        return Promise.resolve(result);
    };
    MockEthereumClient.prototype.toWei = function (amount) {
        return new bignumber_js_1.default(amount).times(Math.pow(10, 18)).toString();
    };
    MockEthereumClient.prototype.fromWei = function (amount) {
        return new bignumber_js_1.default(amount).dividedBy(1000000000000000000).toString();
    };
    MockEthereumClient.prototype.importAddress = function (address) {
        this.addresses[address] = new bignumber_js_1.default(0);
        return Promise.resolve();
    };
    MockEthereumClient.prototype.getAccounts = function () {
        throw new Error("Not implemented.");
    };
    return MockEthereumClient;
}());
exports.MockEthereumClient = MockEthereumClient;
//# sourceMappingURL=mock-ethereum-client.js.map