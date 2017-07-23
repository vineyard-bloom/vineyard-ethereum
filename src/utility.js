"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
var promise_each2_1 = require("promise-each2");
function ethToWei(amount) {
    return amount.times(new bignumber_js_1.default("1000000000000000000"));
}
exports.ethToWei = ethToWei;
function weiToEth(amount) {
    return amount.dividedBy(new bignumber_js_1.default("1000000000000000000"));
}
exports.weiToEth = weiToEth;
function checkAllBalances(eth, web3) {
    var totalBal = 0;
    for (var acctNum in eth.accounts) {
        var acct = eth.accounts[acctNum];
        var acctBal = web3.fromWei(eth.getBalance(acct), "ether");
        totalBal += parseFloat(acctBal);
        console.log("  eth.accounts[" + acctNum + "]: \t" + acct + " \tbalance: " + acctBal + " ether");
    }
    console.log("  Total balance: " + totalBal + " ether");
}
exports.checkAllBalances = checkAllBalances;
;
function createTransaction(e, block) {
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
}
function gatherTransactions(block, transactions, addressManager) {
    var result = [];
    return promise_each2_1.each(transactions
        .filter(function (e) { return e.to; })
        .map(function (e) { return function () { return addressManager.hasAddress(e.to)
        .then(function (success) {
        if (success) {
            result.push(createTransaction(e, block));
        }
    }); }; }))
        .then(function () { return result; });
}
// const bundleSize = 20
// function getTransactionsFromBlock(block, addressManager: AddressManager): Promise<any[]> {
//   const divisions = block.transactions.length / bundleSize
//   for (let i = 0; i < divisions; ++i) {
//
//   }
// }
function getTransactions(client, addressManager, i) {
    return client.getBlock(i)
        .then(function (block) {
        if (!block || !block.transactions)
            return Promise.resolve([]);
        return gatherTransactions(block, block.transactions, addressManager);
    });
}
function scanBlocks(client, addressManager, i, endBlockNumber) {
    if (i > endBlockNumber)
        return Promise.resolve([]);
    return getTransactions(client, addressManager, i)
        .then(function (first) { return scanBlocks(client, addressManager, i + 1, endBlockNumber)
        .then(function (second) { return first.concat(second); }); });
}
function getTransactionsFromRange(client, addressManager, lastBlock, newLastBlock) {
    return scanBlocks(client, addressManager, lastBlock + 1, newLastBlock);
}
exports.getTransactionsFromRange = getTransactionsFromRange;
//# sourceMappingURL=utility.js.map