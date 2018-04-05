"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = require("bignumber.js");
const promise_each2_1 = require("promise-each2");
const Web3 = require('web3');
function ethToWei(amount) {
    return amount.times(new bignumber_js_1.default('1000000000000000000'));
}
exports.ethToWei = ethToWei;
function weiToEth(amount) {
    return amount.dividedBy(new bignumber_js_1.default('1000000000000000000'));
}
exports.weiToEth = weiToEth;
function checkAllBalances(web3) {
    let totalBal = 0;
    let sortableBalances = [];
    for (let acctNum in web3.eth.accounts) {
        let acct = web3.eth.accounts[acctNum];
        let acctBal = web3.fromWei(web3.eth.getBalance(acct), 'ether');
        sortableBalances.push({ 'id': acctNum, 'acct': acct, 'acctBal': acctBal });
        totalBal += parseFloat(acctBal);
    }
    let sortedBalances = sortableBalances.sort(function (a, b) {
        if (a.acctBal > b.acctBal) {
            return -1;
        }
        if (a.acctBal < b.acctBal) {
            return 1;
        }
        return 0;
    });
    for (let acctNum in sortedBalances) {
        let acct = web3.eth.accounts[acctNum];
        console.log('  eth.accounts[' + acctNum + ']: \t' + acct + ' \tbalance: ' + sortedBalances[acctNum].acctBal + ' ether');
    }
    console.log('  Total balance: ' + totalBal + ' ether');
}
exports.checkAllBalances = checkAllBalances;
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
    let result = [];
    return promise_each2_1.each(transactions
        .filter((e) => e.to)
        .map((e) => () => addressManager.hasAddress(e.to)
        .then(success => {
        if (success) {
            result.push(createTransaction(e, block));
        }
    })))
        .then(() => result);
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
        .then(block => {
        if (!block || !block.transactions) {
            return Promise.resolve([]);
        }
        return gatherTransactions(block, block.transactions, addressManager);
    });
}
exports.getTransactions = getTransactions;
function isTransactionValid(client, txid) {
    return Promise.resolve(client.web3.eth.getTransactionReceipt(txid))
        .then(transaction => {
        // '0x0' == failed tx, might still be mined in block, though
        // '0x1' == successful
        if (transaction && transaction.blockNumber && transaction.status === '0x1') {
            return Promise.resolve(true);
        }
        else {
            return Promise.resolve(false);
        }
    }).catch(e => {
        console.error('ERROR GETTING TRANSACTION RECEIPT: ', e);
        return Promise.resolve();
    });
}
exports.isTransactionValid = isTransactionValid;
function scanBlocks(client, addressManager, i, endBlockNumber) {
    if (i > endBlockNumber) {
        return Promise.resolve([]);
    }
    return getTransactions(client, addressManager, i)
        .then(first => scanBlocks(client, addressManager, i + 1, endBlockNumber)
        .then(second => first.concat(second)));
}
function getTransactionsFromRange(client, addressManager, lastBlock, newLastBlock) {
    return scanBlocks(client, addressManager, lastBlock + 1, newLastBlock);
}
exports.getTransactionsFromRange = getTransactionsFromRange;
function initializeWeb3(ethereumConfig, web3) {
    if (!web3) {
        web3 = new Web3();
        web3.setProvider(new web3.providers.HttpProvider(ethereumConfig.http));
    }
    return web3;
}
exports.initializeWeb3 = initializeWeb3;
const formatters = require('web3/lib/web3/formatters');
const promiseRequest = require('./request-promise');
function getEvents(web3, filter) {
    const processedFilter = {
        address: filter.address,
        from: filter.from,
        to: filter.to,
        fromBlock: formatters.inputBlockNumberFormatter(filter.fromBlock),
        toBlock: formatters.inputBlockNumberFormatter(filter.toBlock),
        topics: filter.topics,
    };
    const body = {
        jsonrpc: '2.0',
        method: 'eth_getLogs',
        id: 1,
        params: [processedFilter],
    };
    return promiseRequest({
        method: 'POST',
        uri: web3.currentProvider.host,
        body: body,
        json: true,
        jar: false,
    })
        .then((response) => response.result);
}
exports.getEvents = getEvents;
//# sourceMappingURL=utility.js.map