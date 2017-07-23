import BigNumber from 'bignumber.js';
import {each as promiseEach} from 'promise-each2'
import {AddressManager, EthereumClient} from "./types";

export function ethToWei(amount) {
  return amount.times(new BigNumber("1000000000000000000"))
}

export function weiToEth(amount) {
  return amount.dividedBy(new BigNumber("1000000000000000000"))
}

export function checkAllBalances(eth, web3) {
  var totalBal = 0;
  for (var acctNum in eth.accounts) {
    var acct = eth.accounts[acctNum];
    var acctBal = web3.fromWei(eth.getBalance(acct), "ether");
    totalBal += parseFloat(acctBal);
    console.log("  eth.accounts[" + acctNum + "]: \t" + acct + " \tbalance: " + acctBal + " ether");
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

function getTransactions(client: EthereumClient, addressManager: AddressManager, i: number): Promise<any[]> {
  return client.getBlock(i)
    .then(block => {
      if (!block || !block.transactions)
        return Promise.resolve([])

      return gatherTransactions(block, block.transactions, addressManager)
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