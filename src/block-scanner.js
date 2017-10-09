"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promise_each2_1 = require("promise-each2");
var BlockScanner = /** @class */ (function () {
    function BlockScanner(client, transactionFilter, transactionMap) {
        this.client = client;
        this.transactionFilter = transactionFilter;
        this.transactionMap = transactionMap;
    }
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
        var result = [];
        return promise_each2_1.each(transactions
            .filter(function (e) { return function () { return _this.transactionFilter(e.to); }; })
            .map(function (e) { return function () { return _this.transactionMap(e.to)
            .then(function (success) {
            if (success) {
                result.push(_this.createTransaction(e, block));
            }
        }); }; }))
            .then(function () { return result; });
    };
    // const bundleSize = 20
    // getTransactionsFromBlock(block): Promise<any[]> {
    //   const divisions = block.transactions.length / bundleSize
    //   for (let i = 0; i < divisions; ++i) {
    //
    //   }
    // }
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
    return BlockScanner;
}()); //end BlockScanner class
exports.BlockScanner = BlockScanner;
//# sourceMappingURL=block-scanner.js.map