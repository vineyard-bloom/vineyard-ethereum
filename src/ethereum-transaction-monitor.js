"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promise_each2_1 = require("promise-each2");
var EthereumTransactionMonitor = (function () {
    function EthereumTransactionMonitor(model, ethereumClient, sweepAddress) {
        this.minimumConfirmations = 2;
        this.manager = model;
        this.ethereumClient = ethereumClient;
        this.sweepAddress = sweepAddress;
    }
    EthereumTransactionMonitor.prototype.scanAddress = function (address, lastBlock) {
        var _this = this;
        return this.ethereumClient.listAllTransactions(address, lastBlock)
            .then(function (transactions) {
            if (transactions.length == 0)
                return Promise.resolve();
            var newLastBlock = transactions[transactions.length - 1].blockNumber.toString();
            _this.manager.setLastBlock(newLastBlock);
            return promise_each2_1.each(transactions, function (tx) { return _this.manager.saveTransaction(tx); });
        });
    };
    // sweep(): Promise<void> {
    //   return this.manager.getAddresses()
    //     .then(addresses => promiseEach(addresses, address => this.saveNewTransaction(address))
    //     )
    // }
    EthereumTransactionMonitor.prototype.updateTransactions = function () {
        var _this = this;
        return this.manager.getLastBlock()
            .then(function (lastBlock) {
            return _this.manager.getAddresses()
                .then(function (addresses) { return promise_each2_1.each(addresses, function (address) { return _this.scanAddress(address, lastBlock); }); });
        });
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