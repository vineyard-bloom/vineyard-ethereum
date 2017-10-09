import { each as promiseEach } from 'promise-each2'
import { EthereumClient } from './types';

export type TransactionFilter = (transaction) => Promise<boolean>
export type TransactionMap = (transaction) => any

export class BlockScanner {
  client: EthereumClient
  transactionFilter: TransactionFilter
  transactionMap: TransactionMap

  constructor(client: EthereumClient, transactionFilter: TransactionFilter, transactionMap: TransactionMap) {
  this.client = client
  this.transactionFilter = transactionFilter
  this.transactionMap = transactionMap
}

  createTransaction(e, block) {
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

  gatherTransactions(block, transactions): Promise<any[]> {
    let result = []

    return promiseEach(transactions
      .filter(e => () => this.transactionFilter(e.to))
      .map(e => () => this.transactionMap(e.to)
        .then(success => {
          if (success) {
            result.push(this.createTransaction(e, block))
          }
        })
      )
    )
      .then(() => result)
  }

  getTransactions(i: number): Promise<any[]> {
    return this.client.getBlock(i)
      .then(block => {
        if (!block || !block.transactions)
          return Promise.resolve([])

        return this.gatherTransactions(block, block.transactions)
      })
  }

  scanBlocks(i, endBlockNumber): Promise<any[]> {
    if (i > endBlockNumber)
      return Promise.resolve([])

    return this.getTransactions(i)
      .then(first => this.scanBlocks(i + 1, endBlockNumber)
        .then(second => first.concat(second)))
  }

  getTransactionsFromRange(lastBlock, newLastBlock) {
    return this.scanBlocks(lastBlock + 1, newLastBlock)
  }

}//end BlockScanner class
