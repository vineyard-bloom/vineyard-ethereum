"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
var promise_each2_1 = require("promise-each2");
var promiseRequest = require('./request-promise');
function ethToWei(amount) {
    return amount.times(new bignumber_js_1.default("1000000000000000000"));
}
exports.ethToWei = ethToWei;
function weiToEth(amount) {
    return amount.dividedBy(new bignumber_js_1.default("1000000000000000000"));
}
exports.weiToEth = weiToEth;
function checkAllBalances(web3) {
    var totalBal = 0;
    var sortableBalances = [];
    for (var acctNum in web3.eth.accounts) {
        var acct = web3.eth.accounts[acctNum];
        var acctBal = web3.fromWei(web3.eth.getBalance(acct), "ether");
        sortableBalances.push({ "id": acctNum, "acct": acct, "acctBal": acctBal });
        totalBal += parseFloat(acctBal);
    }
    var sortedBalances = sortableBalances.sort(function (a, b) {
        if (a.acctBal > b.acctBal) {
            return -1;
        }
        if (a.acctBal < b.acctBal) {
            return 1;
        }
        return 0;
    });
    for (var acctNum in sortedBalances) {
        var acct = web3.eth.accounts[acctNum];
        console.log("  eth.accounts[" + acctNum + "]: \t" + acct + " \tbalance: " + sortedBalances[acctNum].acctBal + " ether");
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
exports.getTransactions = getTransactions;
function isTransactionValid(client, txid) {
    return new Promise(function (resolve, reject) {
        client.web3.eth.getTransactionReceipt(txid, function (err, receipt) {
            if (err) {
                console.error('Error getting transaction receipt for ', txid, 'with message ', err.message);
                reject(new Error(err));
            }
            else {
                resolve(receipt);
            }
        });
    }).then(function (receipt) {
        //'0x0' == failed tx, might still be mined in block, though
        //'0x1' == successful
        if (receipt && receipt.blockNumber && receipt.status === '0x1') {
            console.log('VALID TRANSACTION: ', receipt);
            return { receipt: receipt, isValid: true };
        }
        else {
            console.log('INVALID TRANSACTION: ', receipt);
            return { receipt: receipt, isValid: false };
        }
    });
}
exports.isTransactionValid = isTransactionValid;
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
var formatters = require('web3/lib/web3/formatters');
function getEvents(web3, filter) {
    var processedFilter = {
        address: filter.address,
        from: filter.from,
        to: filter.to,
        fromBlock: formatters.inputBlockNumberFormatter(filter.fromBlock),
        toBlock: formatters.inputBlockNumberFormatter(filter.toBlock),
        topics: filter.topics,
    };
    var body = {
        jsonrpc: "2.0",
        method: "eth_getLogs",
        id: 1,
        params: [processedFilter],
    };
    return promiseRequest({
        method: 'POST',
        uri: web3.currentProvider.host,
        body: body,
        json: true,
        jar: false,
    });
}
exports.getEvents = getEvents;
//# sourceMappingURL=utility.js.map