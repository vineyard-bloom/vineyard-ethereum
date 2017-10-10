import { each as promiseEach } from 'promise-each2'
import { EthereumClient, EthereumTransaction } from './types';

//more strongly typed eventually
export type TransactionFilter = (transaction) => Promise<boolean>
export type TransactionMap = (transaction) => Promise<EthereumTransaction || null>

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
    //TODO see if we get other values for tx obj from block
    console.log('block in blockScanner.createTx: ', block)
    return {
      hash: e.hash,//doesnt exist in this case
      nonce: e.nonce,//doesnt exist
      blockHash: e.blockHash,
      blockNumber: e.blockNumber,
      transactionIndex: e.transactionIndex,
      from: e.from,
      to: e.to,
      value: e.value,
      time: new Date(block.timestamp * 1000),
      gasPrice: e.gasPrice,//just gasUsed
      gas: e.gas,//just gasUsed
      input: e.input
    }
  }

  gatherTransactions(block, transactions): Promise<any[]> {
    let result = []

    return promiseEach(transactions
      .filter(e => () => this.transactionFilter(e))
      .map(e => () => this.transactionMap(e)
        .then(success => {
          if (success) {
            console.log('tx after map and filter: ', e)
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
