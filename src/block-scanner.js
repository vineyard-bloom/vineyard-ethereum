"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promise_each2_1 = require("promise-each2");
const utility_1 = require("./utility");
// more strongly typed eventually
// export type TransactionFilter = (transaction) => Promise<boolean>
// export type TransactionMap = (transaction) => Promise<EthereumTransaction>
class BlockScanner {
    constructor(model, client, minimumConfirmations = 13) {
        this.minimumConfirmations = 13;
        this.client = client;
        this.manager = model;
        this.minimumConfirmations = minimumConfirmations;
    }
    gatherTransactions(block, transactions) {
        return this.manager.filterSaltTransactions(transactions)
            .then((saltTransactions) => this.manager.filterAccountAddresses(saltTransactions))
            .then((databaseAddresses) => databaseAddresses.map((tx) => this.manager.mapTransaction(tx, block)));
    }
    getTransactions(i) {
        return this.client.getBlock(i)
            .then(block => {
            if (!block || !block.transactions) {
                return Promise.resolve([]);
            }
            return this.gatherTransactions(block, block.transactions);
        });
    }
    scanBlocks(i, endBlockNumber) {
        if (i > endBlockNumber) {
            return Promise.resolve([]);
        }
        return this.getTransactions(i)
            .then(first => this.scanBlocks(i + 1, endBlockNumber)
            .then(second => first.concat(second)));
    }
    getTransactionsFromRange(lastBlock, newLastBlock) {
        return this.scanBlocks(lastBlock + 1, newLastBlock);
    }
    processBlock(blockIndex) {
        return this.getTransactions(blockIndex)
            .then(transactions => {
            console.log('Scanning block', blockIndex, 'tx-count:', transactions.length);
            return transactions.length === 0
                ? Promise.resolve()
                : promise_each2_1.each(transactions, (tx) => this.manager.saveTransaction(tx, blockIndex));
        });
    }
    processBlocks(blockIndex, endBlockNumber) {
        const secondPassOffset = 5;
        if (blockIndex > endBlockNumber) {
            return Promise.resolve();
        }
        return this.processBlock(blockIndex)
            .then(() => {
            console.log('Finished block', blockIndex);
            return this.manager.setLastBlock(blockIndex);
        })
            .then(() => {
            if (blockIndex > secondPassOffset) {
                return this.processBlock(blockIndex - secondPassOffset)
                    .then(() => {
                    console.log('Second scan: Finished block', blockIndex - secondPassOffset);
                    return this.manager.setLastBlock(blockIndex);
                });
            }
        })
            .then(first => this.processBlocks(blockIndex + 1, endBlockNumber));
    }
    updateTransactions() {
        return this.manager.getLastBlock()
            .then((lastBlock) => this.client.getBlockNumber()
            .then((newLastBlock) => {
            console.log('Updating blocks (last - current)', lastBlock, newLastBlock);
            if (newLastBlock === lastBlock) {
                return Promise.resolve();
            }
            return this.processBlocks(lastBlock + 1, newLastBlock)
                .then(() => this.updatePending(newLastBlock - this.minimumConfirmations));
        }));
    }
    resolveTransaction(transaction) {
        return utility_1.isTransactionValid(this.client, transaction.txid)
            .then(valid => {
            if (!valid) {
                console.log('Denying transaction', transaction.txid);
                return this.manager.setStatus(transaction, 2)
                    .then(() => this.manager.onDenial(transaction));
            }
            else {
                console.log('Confirming transaction', transaction.txid);
                return this.manager.setStatus(transaction, 1)
                    .then(() => this.manager.onConfirm(transaction));
            }
        }).catch(e => {
            console.error(e);
        });
    }
    updatePending(newLastBlock) {
        return this.manager.getResolvedTransactions(newLastBlock)
            .then((transactions) => {
            promise_each2_1.each(transactions, (transaction) => this.resolveTransaction(transaction));
        })
            .catch((e) => {
            console.error(e);
        });
    }
} // end BlockScanner class
exports.BlockScanner = BlockScanner;
//# sourceMappingURL=block-scanner.js.map