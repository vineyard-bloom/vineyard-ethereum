import BigNumber from 'bignumber.js';
import { each as promiseEach } from 'promise-each2'
import { AddressManager, EthereumClient } from "./types";

const promiseRequest = require('./request-promise')

export function ethToWei(amount) {
  return amount.times(new BigNumber("1000000000000000000"))
}

export function weiToEth(amount) {
  return amount.dividedBy(new BigNumber("1000000000000000000"))
}

export function checkAllBalances(web3) {
  var totalBal = 0;
  var sortableBalances = []
  for (var acctNum in web3.eth.accounts) {
    var acct = web3.eth.accounts[acctNum];
    var acctBal = web3.fromWei(web3.eth.getBalance(acct), "ether");
    sortableBalances.push({ "id": acctNum, "acct": acct, "acctBal": acctBal })
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
};


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
  }
}

function gatherTransactions(block, transactions, addressManager: AddressManager): Promise<any[]> {
  let result = []
  return promiseEach(transactions
    .filter(e => e.to)
    .map(e => () => addressManager.hasAddress(e.to)
      .then(success => {
        if (success) {
          result.push(createTransaction(e, block))
        }
      })
    )
  )
    .then(() => result)
}

// const bundleSize = 20
// function getTransactionsFromBlock(block, addressManager: AddressManager): Promise<any[]> {
//   const divisions = block.transactions.length / bundleSize
//   for (let i = 0; i < divisions; ++i) {
//
//   }
// }

export function getTransactions(client: EthereumClient, addressManager: AddressManager, i: number): Promise<any[]> {
  return client.getBlock(i)
    .then(block => {
      if (!block || !block.transactions)
        return Promise.resolve([])

      return gatherTransactions(block, block.transactions, addressManager)
    })
}

export interface ValidationResult{
  receipt: any
  isValid: boolean
}
export function isTransactionValid(client: EthereumClient, txid): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    client.web3.eth.getTransactionReceipt(txid, (err, receipt) => {
      if (err) {
        console.error('Error getting transaction receipt for ', txid, 'with message ', err.message)
        reject(new Error(err))
      } else {
        resolve(receipt)
      }
    })
  }).then(receipt => {
    //'0x0' == failed tx, might still be mined in block, though
    //'0x1' == successful
    if (receipt && receipt.blockNumber && receipt.status === '0x1') {
      console.log('VALID TRANSACTION: ', receipt)
      return { receipt: receipt, isValid: true }
    } else {
      console.log('INVALID TRANSACTION: ', receipt)
      return { receipt: receipt, isValid: false }
    }
  })
}

function scanBlocks(client: EthereumClient, addressManager: AddressManager, i, endBlockNumber): Promise<any[]> {
  if (i > endBlockNumber)
    return Promise.resolve([])

  return getTransactions(client, addressManager, i)
    .then(first => scanBlocks(client, addressManager, i + 1, endBlockNumber)
      .then(second => first.concat(second)))
}

export function getTransactionsFromRange(client: EthereumClient, addressManager: AddressManager, lastBlock, newLastBlock) {
  return scanBlocks(client, addressManager, lastBlock + 1, newLastBlock)
}

const formatters = require('web3/lib/web3/formatters')

export function getEvents(web3: any, filter: any): Promise<any> {
  const processedFilter = {
    address: filter.address,
    from: filter.from,
    to: filter.to,
    fromBlock: formatters.inputBlockNumberFormatter(filter.fromBlock),
    toBlock: formatters.inputBlockNumberFormatter(filter.toBlock),
    topics: filter.topics,
  }

  const body = {
    jsonrpc: "2.0",
    method: "eth_getLogs",
    id: 1,
    params: [processedFilter],
  }
  return promiseRequest({
    method: 'POST',
    uri: web3.currentProvider.host,
    body: body,
    json: true,
    jar: false,
  })
}