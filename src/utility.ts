import BigNumber from 'bignumber.js'
import { each as promiseEach } from 'promise-each2'
import { AddressManager, EthereumClient } from './types'
import { Web3Client } from './client-functions'
import { Web3EthereumClientConfig } from './ethereum-client'

const Web3 = require('web3')

export function ethToWei(amount: BigNumber) {
  return amount.times(new BigNumber('1000000000000000000'))
}

export function weiToEth(amount: BigNumber) {
  return amount.dividedBy(new BigNumber('1000000000000000000'))
}

export function checkAllBalances(web3: any) {
  let totalBal = 0
  let sortableBalances = []
  for (let acctNum in web3.eth.accounts) {
    let acct = web3.eth.accounts[acctNum]
    let acctBal = web3.fromWei(web3.eth.getBalance(acct), 'ether')
    sortableBalances.push({ 'id': acctNum, 'acct': acct, 'acctBal': acctBal })
    totalBal += parseFloat(acctBal)
  }
  let sortedBalances = sortableBalances.sort(function (a, b) {
    if (a.acctBal > b.acctBal) {
      return -1
    }
    if (a.acctBal < b.acctBal) {
      return 1
    }
    return 0
  })
  for (let acctNum in sortedBalances) {
    let acct = web3.eth.accounts[acctNum]
    console.log('  eth.accounts[' + acctNum + ']: \t' + acct + ' \tbalance: ' + sortedBalances[acctNum].acctBal + ' ether')
  }
  console.log('  Total balance: ' + totalBal + ' ether')
}

function createTransaction(e: any, block: any) {
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

function gatherTransactions(block: any, transactions: any, addressManager: AddressManager): Promise<any[]> {
  let result: any[] = []
  return promiseEach(transactions
    .filter((e: any) => e.to)
    .map((e: any) => () => addressManager.hasAddress(e.to)
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
      if (!block || !block.transactions) {
        return Promise.resolve([])
      }

      return gatherTransactions(block, block.transactions, addressManager)
    })
}

export function isTransactionValid(client: EthereumClient, txid: string): Promise<Boolean | void> {
  return Promise.resolve((client as any).web3.eth.getTransactionReceipt(txid))
    .then(transaction => {
      // '0x0' == failed tx, might still be mined in block, though
      // '0x1' == successful
      if (transaction && transaction.blockNumber && transaction.status === '0x1') {
        return Promise.resolve(true)
      } else {
        return Promise.resolve(false)
      }
    }).catch(e => {
      console.error('ERROR GETTING TRANSACTION RECEIPT: ', e)
      return Promise.resolve()
    })
}

function scanBlocks(client: EthereumClient, addressManager: AddressManager, i: number, endBlockNumber: number): Promise<any[]> {
  if (i > endBlockNumber) {
    return Promise.resolve([])
  }

  return getTransactions(client, addressManager, i)
    .then(first => scanBlocks(client, addressManager, i + 1, endBlockNumber)
      .then(second => first.concat(second)))
}

export function getTransactionsFromRange(client: EthereumClient, addressManager: AddressManager, lastBlock: any, newLastBlock: any) {
  return scanBlocks(client, addressManager, lastBlock + 1, newLastBlock)
}

export function initializeWeb3(ethereumConfig: Web3EthereumClientConfig, web3?: Web3Client) {
  if (!web3) {
    web3 = new Web3()
    web3.setProvider(new web3.providers.HttpProvider(ethereumConfig.http))
  }
  return web3
}

const formatters = require('web3/lib/web3/formatters')
const promiseRequest = require('./request-promise')

export interface ContractEvent {
  transactionHash: string
  address: string
}

export interface EventFilter {
  address?: string | string[]
  to?: string
  from?: string
  toBlock?: number
  fromBlock?: number
  topics?: any[]
}

export function getEvents(web3: any, filter: EventFilter): Promise<ContractEvent[]> {
  const processedFilter = {
    address: filter.address,
    from: filter.from,
    to: filter.to,
    fromBlock: formatters.inputBlockNumberFormatter(filter.fromBlock),
    toBlock: formatters.inputBlockNumberFormatter(filter.toBlock),
    topics: filter.topics,
  }

  const body = {
    jsonrpc: '2.0',
    method: 'eth_getLogs',
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
    .then((response: any) => response.result)
}