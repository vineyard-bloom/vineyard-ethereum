"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promise_each2_1 = require("promise-each2");
var utility_1 = require("./utility");
var EthereumTransactionMonitor = (function () {
    function EthereumTransactionMonitor(model, ethereumClient, sweepAddress) {
        this.minimumConfirmations = 2;
        this.manager = model;
        this.ethereumClient = ethereumClient;
        this.sweepAddress = sweepAddress;
    }
    // scanAddress(address: string, lastBlock: number) {
    //   return this.ethereumClient.listAllTransactions(address, lastBlock)
    //     .then(transactions => {
    //       if (transactions.length == 0)
    //        return Promise.resolve()
    //
    //       const newLastBlock = transactions[transactions.length - 1].blockNumber.toString()
    //       this.manager.setLastBlock(newLastBlock)
    //       return promiseEach(transactions, tx => this.manager.saveTransaction(tx))
    //     })
    // }
    // sweep(): Promise<void> {
    //   return this.manager.getAddresses()
    //     .then(addresses => promiseEach(addresses, address => this.saveNewTransaction(address))
    //     )
    // }
    EthereumTransactionMonitor.prototype.resolveTransaction = function (transaction) {
        var _this = this;
        return this.ethereumClient.getTransaction(transaction.hash)
            .then(function (result) {
            if (!result || !result.blockNumber) {
                _this.manager.onDenial(result);
            }
            else {
                _this.manager.onConfirm(result);
            }
        });
    };
    EthereumTransactionMonitor.prototype.updatePending = function (newLastBlock) {
        var _this = this;
        return this.manager.getResolvedTransactions(newLastBlock)
            .then(function (transactions) { return promise_each2_1.each(transactions, function (transaction) { return _this.resolveTransaction(transaction); }); });
    };
    EthereumTransactionMonitor.prototype.updateTransactions = function () {
        var _this = this;
        return this.manager.getLastBlock()
            .then(function (lastBlock) { return _this.ethereumClient.getBlockNumber()
            .then(function (newLastBlock) {
            if (newLastBlock == lastBlock)
                return Promise.resolve();
            console.log('Scanning block', newLastBlock);
            return utility_1.getTransactionsFromRange(_this.ethereumClient, _this.manager, lastBlock, newLastBlock)
                .then(function (transactions) { return transactions.length == 0
                ? Promise.resolve()
                : promise_each2_1.each(transactions, function (tx) {
                    console.log('Saving transaction', tx.hash);
                    return _this.manager.saveTransaction(tx);
                }); })
                .then(function () {
                console.log('Finished block', newLastBlock);
                return _this.manager.setLastBlock(newLastBlock);
            })
                .then(function () { return _this.updatePending(newLastBlock - 5); });
        }); });
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