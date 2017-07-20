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
        var fromBalance = new bignumber_js_1.default(this.addresses[fromAddress]);
        if (fromBalance.lessThan(value))
            throw new Error('not enough funds');
        var toBalance = new bignumber_js_1.default(this.addresses[toAddress]);
        this.addresses[fromAddress] = fromBalance.minus(new bignumber_js_1.default(value));
        this.addresses[toAddress] = toBalance.plus(new bignumber_js_1.default(value));
        return Promise.resolve({
            from: fromAddress,
            to: toAddress,
            wei: value,
            gas: gas
        });
    };
    MockEthereumClient.prototype.listAllTransactions = function () {
        throw new Error("Not yet implemented.");
    };
    MockEthereumClient.prototype.toWei = function (amount) {
        return new bignumber_js_1.default(amount).times(Math.pow(10, 18)).toString();
    };
    MockEthereumClient.prototype.fromWei = function (amount) {
        return new bignumber_js_1.default(amount).dividedBy(1000000000000000000).toString();
    };
    MockEthereumClient.prototype.importAddress = function (address) {
        this.addresses[address] = 0;
        return Promise.resolve();
    };
    MockEthereumClient.prototype.getAccounts = function () {
        throw new Error("Not implemented.");
    };
    return MockEthereumClient;
}());
exports.MockEthereumClient = MockEthereumClient;
//# sourceMappingURL=mock-ethereum-client.js.map