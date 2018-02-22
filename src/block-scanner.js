"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promise_each2_1 = require("promise-each2");
var utility_1 = require("./utility");
var BlockScanner = /** @class */ (function () {
    function BlockScanner(model, client, minimumConfirmations) {
        if (minimumConfirmations === void 0) { minimumConfirmations = 13; }
        this.minimumConfirmations = 13;
        this.client = client;
        this.manager = model;
        this.minimumConfirmations = minimumConfirmations;
    }
    BlockScanner.prototype.resolveTransaction = function (transaction) {
        var _this = this;
        console.log('RESOLVING TRANSACTION: ', transaction.txid);
        return utility_1.isTransactionValid(this.client, transaction.txid)
            .then(function (valid) {
            if (!valid) {
                console.log('Denying transaction', transaction);
                return _this.manager.setStatus(transaction, 2)
                    .then(function () { return _this.manager.onDenial(transaction); });
            }
            else {
                return utility_1.getEvents(_this.client.web3, {
                    fromBlock: transaction.blockIndex,
                    toBlock: transaction.blockIndex,
                })
                    .then(function (events) {
                    if (events.result.some(function (e) { return e.transactionHash == transaction.txid; })) {
                        console.log('Confirming transaction', transaction);
                        return _this.manager.setStatus(transaction, 1)
                            .then(function () { return _this.manager.onConfirm(transaction); });
                    }
                    else {
                        console.log('Denying transaction at contract layer', transaction);
                        return _this.manager.setStatus(transaction, 2)
                            .then(function () { return _this.manager.onDenial(transaction); });
                    }
                });
            }
        }).catch(function (e) { console.error('Error resolving transation: ', e); });
    };
    BlockScanner.prototype.updatePending = function (newLastBlock) {
        var _this = this;
        console.log('IN UPDATE PENDING');
        return this.manager.getResolvedTransactions(newLastBlock)
            .then(function (transactions) {
            console.log('RESOLVED TRANSACTIONS ', transactions);
            return promise_each2_1.each(transactions, function (transaction) { return _this.resolveTransaction(transaction); });
        })
            .catch(function (e) { console.error(e); });
    };
    BlockScanner.prototype.gatherTransactions = function (block, transactions) {
        var _this = this;
        return this.manager.filterSaltTransactions(transactions)
            .then(function (saltTransactions) { return _this.manager.filterAccountAddresses(saltTransactions); })
            .then(function (databaseAddresses) { return databaseAddresses.map(function (tx) { return _this.manager.mapTransaction(tx, block); }); })
            .catch(function (e) { console.error('ERROR GATHERING TRANSACTIONS: ', e); });
    };
    BlockScanner.prototype.getTransactions = function (i) {
        var _this = this;
        return this.client.getBlock(i)
            .then(function (block) {
            if (!block || !block.transactions)
                return Promise.resolve([]);
            return _this.gatherTransactions(block, block.transactions);
        });
    };
    BlockScanner.prototype.scanBlocks = function (i, endBlockNumber) {
        var _this = this;
        if (i > endBlockNumber)
            return Promise.resolve([]);
        return this.getTransactions(i)
            .then(function (first) { return _this.scanBlocks(i + 1, endBlockNumber)
            .then(function (second) { return first.concat(second); }); });
    };
    BlockScanner.prototype.getTransactionsFromRange = function (lastBlock, newLastBlock) {
        return this.scanBlocks(lastBlock + 1, newLastBlock);
    };
    BlockScanner.prototype.processBlock = function (blockIndex) {
        var _this = this;
        return this.getTransactions(blockIndex)
            .then(function (transactions) {
            console.log('Scanning block', blockIndex, 'at', new Date(), 'tx-count:', transactions.length);
            return transactions.length == 0
                ? Promise.resolve()
                : promise_each2_1.each(transactions, function (tx) { return _this.manager.saveTransaction(tx, blockIndex); });
        });
    };
    BlockScanner.prototype.processBlocks = function (blockIndex, endBlockNumber) {
        var _this = this;
        var secondPassOffset = 5;
        if (blockIndex > endBlockNumber)
            return Promise.resolve();
        return this.processBlock(blockIndex)
            .then(function () {
            console.log('Finished block', blockIndex);
            return _this.manager.setLastBlock(blockIndex);
        })
            .then(function () {
            if (blockIndex > secondPassOffset) {
                return _this.processBlock(blockIndex - secondPassOffset)
                    .then(function () {
                    console.log('Second scan: Finished block', blockIndex - secondPassOffset);
                    return _this.manager.setLastBlock(blockIndex);
                });
            }
        })
            .then(function (first) { return _this.processBlocks(blockIndex + 1, endBlockNumber); });
    };
    BlockScanner.prototype.updateTransactions = function () {
        var _this = this;
        return this.manager.getLastBlock()
            .then(function (lastBlock) { return _this.client.getBlockNumber()
            .then(function (newLastBlock) {
            console.log('Updating blocks (last - current)', lastBlock, newLastBlock);
            if (newLastBlock == lastBlock)
                return Promise.resolve();
            return _this.processBlocks(lastBlock + 1, newLastBlock)
                .then(function () {
                console.log('STARTING UPDATE PENDING, newLastBlock: ', newLastBlock);
                return _this.updatePending(newLastBlock - _this.minimumConfirmations);
            });
        }); });
    };
    return BlockScanner;
}()); //end BlockScanner class
exports.BlockScanner = BlockScanner;
//# sourceMappingURL=block-scanner.js.map