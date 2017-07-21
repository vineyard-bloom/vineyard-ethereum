"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promise_each2_1 = require("promise-each2");
var bignumber_js_1 = require("bignumber.js");
var types_1 = require("./types");
var EthereumTransactionMonitor = (function () {
    function EthereumTransactionMonitor(model, ethereumClient, sweepAddress) {
        this.minimumConfirmations = 2;
        this.manager = model;
        this.ethereumClient = ethereumClient;
        this.sweepAddress = sweepAddress;
    }
    EthereumTransactionMonitor.prototype.saveNewTransaction = function (address) {
        var _this = this;
        return this.ethereumClient.getBalance(address)
            .then(function (balance) {
            if (balance === undefined)
                throw new Error('No account found with address: ' + address);
            if (balance.equals(0))
                return Promise.resolve();
            return _this.ethereumClient.send(address, _this.sweepAddress, new bignumber_js_1.default(balance) - types_1.gasWei)
                .then(function (sweepTransaction) {
                return _this.manager.getLastBlock()
                    .then(function (lastblock) {
                    if (typeof lastblock !== 'string' && typeof lastblock !== 'number')
                        lastblock = '0';
                    _this.ethereumClient.listAllTransactions(address, parseInt(lastblock))
                        .then(function (transactions) {
                        if (transactions.length == 0)
                            throw new Error("Could not find transactions for sweep.");
                        var newLastBlock = transactions[transactions.length - 1].blockNumber.toString();
                        _this.manager.setLastBlock(newLastBlock);
                        return promise_each2_1.each(transactions, function (tx) {
                            _this.manager.saveTransaction(tx);
                        });
                    });
                });
            });
        });
    };
    EthereumTransactionMonitor.prototype.sweep = function () {
        var _this = this;
        return this.manager.getAddresses()
            .then(function (addresses) { return promise_each2_1.each(addresses, function (address) { return _this.saveNewTransaction(address); }); });
    };
    return EthereumTransactionMonitor;
}());
exports.EthereumTransactionMonitor = EthereumTransactionMonitor;
var EthereumBalanceMonitor = (function () {
    function EthereumBalanceMonitor(model, ethereumClient, sweepAddress) {
        this.minimumConfirmations = 2;
        this.manager = model;
        this.ethereumClient = ethereumClient;
        this.sweepAddress = sweepAddress;
    }
    EthereumBalanceMonitor.prototype.saveNewTransaction = function (address) {
        var _this = this;
        return this.ethereumClient.getBalance(address)
            .then(function (balance) {
            return _this.ethereumClient.send(address, _this.sweepAddress, balance)
                .then(function (transaction) { return _this.manager.saveTransaction(transaction); });
        });
    };
    EthereumBalanceMonitor.prototype.sweep = function () {
        var _this = this;
        return this.manager.getAddresses()
            .then(function (addresses) { return promise_each2_1.each(addresses, function (address) { return _this.saveNewTransaction(address); }); });
    };
    return EthereumBalanceMonitor;
}());
exports.EthereumBalanceMonitor = EthereumBalanceMonitor;
//# sourceMappingURL=ethereum-transaction-monitor.js.map