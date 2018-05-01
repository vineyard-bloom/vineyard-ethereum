"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promise_each2_1 = require("promise-each2");
const utility_1 = require("./utility");
// EthereumTransactionMonitor is deprecated.  Use one of the monitors from vineyard-minotaur instead.
class EthereumTransactionMonitor {
    constructor(model, ethereumClient, sweepAddress, minimumConfirmations = 12) {
        this.minimumConfirmations = 12;
        this.manager = model;
        this.ethereumClient = ethereumClient;
        this.sweepAddress = sweepAddress;
        this.minimumConfirmations = minimumConfirmations;
    }
    processBlock(blockIndex) {
        return utility_1.getTransactions(this.ethereumClient, this.manager, blockIndex)
            .then(transactions => {
            console.log('Scanning block', blockIndex, 'tx-count:', transactions.length);
            return transactions.length === 0
                ? Promise.resolve()
                : promise_each2_1.each(transactions, (tx) => {
                    console.log('Saving transaction', tx.hash);
                    return this.manager.saveTransaction(tx, blockIndex);
                });
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
            .then(lastBlock => this.ethereumClient.getBlockNumber()
            .then(newLastBlock => {
            console.log('Updating blocks (last - current)', lastBlock, newLastBlock);
            if (newLastBlock === lastBlock) {
                return Promise.resolve();
            }
            return this.processBlocks(lastBlock + 1, newLastBlock)
                .then(() => this.updatePending(newLastBlock - this.minimumConfirmations));
        }));
    }
    resolveTransaction(transaction) {
        return this.ethereumClient.getTransaction(transaction.txid)
            .then((result) => {
            if (!result || !result.blockNumber) {
                console.log('Denying transaction', result.txid);
                return this.manager.setStatus(transaction, 2)
                    .then(() => this.manager.onDenial(transaction));
            }
            else {
                console.log('Confirming transaction', result.txid);
                return this.manager.setStatus(transaction, 1)
                    .then(() => this.manager.onConfirm(transaction));
            }
        });
    }
    updatePending(newLastBlock) {
        return this.manager.getResolvedTransactions(newLastBlock)
            .then(transactions => promise_each2_1.each(transactions, (transaction) => this.resolveTransaction(transaction)));
    }
}
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