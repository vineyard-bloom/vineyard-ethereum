"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getFullBlock(block) {
}
exports.getFullBlock = getFullBlock;
function getNextFullBlock(block) {
    // return getTransactions(this.ethereumClient, this.manager, blockIndex)
    //   .then(transactions => {
    //     console.log('Scanning block', blockIndex, 'tx-count:', transactions.length)
    //     return transactions.length == 0
    //       ? Promise.resolve()
    //       : promiseEach(transactions, tx => {
    //         console.log('Saving transaction', tx.hash)
    //         return this.manager.saveTransaction(tx, blockIndex)
    //       })
    //   })
}
exports.getNextFullBlock = getNextFullBlock;
//# sourceMappingURL=block-getter.js.map