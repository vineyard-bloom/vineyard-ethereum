"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promise_each2_1 = require("promise-each2");
var utility_1 = require("./utility");
var EthereumTransactionMonitor = (function () {
    function EthereumTransactionMonitor(model, ethereumClient, sweepAddress, minimumConfirmations) {
        if (minimumConfirmations === void 0) { minimumConfirmations = 12; }
        this.minimumConfirmations = 12;
        this.manager = model;
        this.ethereumClient = ethereumClient;
        this.sweepAddress = sweepAddress;
        this.minimumConfirmations = minimumConfirmations;
    }
    EthereumTransactionMonitor.prototype.processBlock = function (blockIndex) {
        var _this = this;
        return utility_1.getTransactions(this.ethereumClient, this.manager, blockIndex)
            .then(function (transactions) {
            console.log('Scanning block', blockIndex, 'tx-count:', transactions.length);
            return transactions.length === 0
                ? Promise.resolve()
                : promise_each2_1.each(transactions, function (tx) {
                    console.log('Saving transaction', tx.hash);
                    return _this.manager.saveTransaction(tx, blockIndex);
                });
        });
    };
    EthereumTransactionMonitor.prototype.processBlocks = function (blockIndex, endBlockNumber) {
        var _this = this;
        var secondPassOffset = 5;
        if (blockIndex > endBlockNumber) {
            return Promise.resolve();
        }
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
    EthereumTransactionMonitor.prototype.updateTransactions = function () {
        var _this = this;
        return this.manager.getLastBlock()
            .then(function (lastBlock) { return _this.ethereumClient.getBlockNumber()
            .then(function (newLastBlock) {
            console.log('Updating blocks (last - current)', lastBlock, newLastBlock);
            if (newLastBlock === lastBlock) {
                return Promise.resolve();
            }
            return _this.processBlocks(lastBlock + 1, newLastBlock)
                .then(function () { return _this.updatePending(newLastBlock - _this.minimumConfirmations); });
        }); });
    };
    EthereumTransactionMonitor.prototype.resolveTransaction = function (transaction) {
        var _this = this;
        return this.ethereumClient.getTransaction(transaction.txid)
            .then(function (result) {
            if (!result || !result.blockNumber) {
                console.log('Denying transaction', result.txid);
                return _this.manager.setStatus(transaction, 2)
                    .then(function () { return _this.manager.onDenial(transaction); });
            }
            else {
                console.log('Confirming transaction', result.txid);
                return _this.manager.setStatus(transaction, 1)
                    .then(function () { return _this.manager.onConfirm(transaction); });
            }
        });
    };
    EthereumTransactionMonitor.prototype.updatePending = function (newLastBlock) {
        var _this = this;
        return this.manager.getResolvedTransactions(newLastBlock)
            .then(function (transactions) { return promise_each2_1.each(transactions, function (transaction) { return _this.resolveTransaction(transaction); }); });
    };
    return EthereumTransactionMonitor;
}());
exports.EthereumTransactionMonitor = EthereumTransactionMonitor;
// export class EthereumBalanceMonitor<EthereumTransaction> {
//   private ethereumClient:any
//   private minimumConfirmations: number = 2;
//   private sweepAddress: string
//   private manager: GenericEthereumManager<EthereumTransaction>
//
//   constructor(model: GenericEthereumManager<EthereumTransaction>, ethereumClient: EthereumClient, sweepAddress: string) {
//     this.manager = model
//     this.ethereumClient = ethereumClient
//     this.sweepAddress = sweepAddress
//   }
//
//   private saveNewTransaction(address:string): Promise<void> {
//     return this.ethereumClient.getBalance(address)
//       .then((balance:any) => {
//         return this.ethereumClient.send(address, this.sweepAddress, balance)
//           .then((transaction:any) => this.manager.saveTransaction(transaction))
//       })
//   }
//
//   sweep(): Promise<void> {
//     throw new Error("getAddresses will need paging.")
//     return this.manager.getAddresses()
//       .then(addresses => promiseEach(addresses, address => this.saveNewTransaction(address)))
//   }
// }
//# sourceMappingURL=ethereum-transaction-monitor.js.map