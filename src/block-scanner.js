"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promise_each2_1 = require("promise-each2");
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
        return this.client.getTransaction(transaction.txid)
            .then(function (result) {
            if (!result || !result.blockNumber) {
                console.log('Denying transaction', result);
                return _this.manager.setStatus(transaction, 2)
                    .then(function () { return _this.manager.onDenial(transaction); });
            }
            else {
                console.log('Confirming transaction', result);
                return _this.manager.setStatus(transaction, 1)
                    .then(function () { return _this.manager.onConfirm(transaction); });
            }
        }).catch(function (e) { console.error(e); });
    };
    BlockScanner.prototype.updatePending = function (newLastBlock) {
        var _this = this;
        return this.manager.getResolvedTransactions(newLastBlock)
            .then(function (transactions) {
            promise_each2_1.each(transactions, function (transaction) { return _this.resolveTransaction(transaction); });
        })
            .catch(function (e) { console.error(e); });
    };
    BlockScanner.prototype.createTransaction = function (e, block) {
        return {
            hash: e.hash,
            nonce: e.nonce,
            blockHash: e.blockHash,
            blockNumber: e.blockNumber,
            transactionIndex: e.transactionIndex,
            from: e.from,
            to: e.to,
            value: e.value,
            time: new Date(block.timestamp * 1000),
            gasPrice: e.gasPrice,
            gas: e.gas,
            input: e.input
        };
    };
    BlockScanner.prototype.gatherTransactions = function (block, transactions) {
        var _this = this;
        //should be empty if tx does not meet filter params
        var result = [];
        // return transactions.filter(e => this.manager.transactionFilter(e))
        return promise_each2_1.each(transactions
            .filter(function (tx) {
            return _this.manager.transactionFilter(tx)
                .then(function (matchingTx) {
                return _this.manager.transactionMap(matchingTx)
                    .then(function (mappedTx) {
                    if (mappedTx) {
                        console.log('tx after map and filter: ', mappedTx);
                        result.push(_this.createTransaction(mappedTx, block));
                        return result;
                    }
                });
            });
        })).then(function () { return result; });
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
            console.log('Scanning block', blockIndex, 'tx-count:', transactions.length);
            return transactions.length == 0
                ? Promise.resolve()
                : promise_each2_1.each(transactions, function (tx) {
                    // console.log('Saving transaction', tx)
                    return _this.manager.saveTransaction(tx, blockIndex);
                });
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
                .then(function () { return _this.updatePending(newLastBlock - _this.minimumConfirmations); });
        }); });
    };
    return BlockScanner;
}()); //end BlockScanner class
exports.BlockScanner = BlockScanner;
//# sourceMappingURL=block-scanner.js.map