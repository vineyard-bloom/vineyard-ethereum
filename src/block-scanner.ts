import {each as promiseEach} from 'promise-each2'
import {EthereumClient, EthereumTransaction, GenericEthereumManager} from './types'
import {isTransactionValid} from './utility'

//more strongly typed eventually
// export type TransactionFilter = (transaction) => Promise<boolean>
// export type TransactionMap = (transaction) => Promise<EthereumTransaction>

export class BlockScanner<Transaction extends EthereumTransaction> {
  private client: EthereumClient
  private minimumConfirmations: number = 13
  private manager: any

  constructor(model: any, client: EthereumClient, minimumConfirmations: number = 13) {
    this.client = client
    this.manager = model
    this.minimumConfirmations = minimumConfirmations
  }

  private resolveTransaction(transaction: any): Promise<any> {
    return isTransactionValid(this.client, transaction.txid)
      .then(valid => {
        if (!valid) {
          console.log('Denying transaction', transaction.txid)
          return this.manager.setStatus(transaction, 2)
            .then(() => this.manager.onDenial(transaction))
        }
        else {
          console.log('Confirming transaction', transaction.txid)
          return this.manager.setStatus(transaction, 1)
            .then(() => this.manager.onConfirm(transaction))
        }
      }).catch(e => {
        console.error(e)
      })
  }

  private updatePending(newLastBlock: number): Promise<void> {
    return this.manager.getResolvedTransactions(newLastBlock)
      .then((transactions: any) => {
        promiseEach(transactions, (transaction: any) => this.resolveTransaction(transaction))
      })
      .catch((e: Error) => {
        console.error(e)
      })
  }

  gatherTransactions(block: any, transactions: any): Promise<any[]> {
    return this.manager.filterSaltTransactions(transactions)
      .then((saltTransactions: any) => this.manager.filterAccountAddresses(saltTransactions))
      .then((databaseAddresses: any) => databaseAddresses.map((tx: any) => this.manager.mapTransaction(tx, block))
      )
  }

  getTransactions(i: number): Promise<any[]> {
    return this.client.getBlock(i)
      .then(block => {
        if (!block || !block.transactions)
          return Promise.resolve([])
        return this.gatherTransactions(block, block.transactions)
      })
  }

  scanBlocks(i: number, endBlockNumber: number): Promise<any[]> {
    if (i > endBlockNumber)
      return Promise.resolve([])

    return this.getTransactions(i)
      .then(first => this.scanBlocks(i + 1, endBlockNumber)
        .then(second => first.concat(second)))
  }

  getTransactionsFromRange(lastBlock: number, newLastBlock: number) {
    return this.scanBlocks(lastBlock + 1, newLastBlock)
  }

  processBlock(blockIndex:number): Promise<void> {
    return this.getTransactions(blockIndex)
      .then(transactions => {
        console.log('Scanning block', blockIndex, 'tx-count:', transactions.length)
        return transactions.length == 0
          ? Promise.resolve()
          : promiseEach(transactions, (tx:any) => this.manager.saveTransaction(tx, blockIndex))
      })
  }

  processBlocks(blockIndex:number, endBlockNumber:number): Promise<void> {
    const secondPassOffset = 5

    if (blockIndex > endBlockNumber)
      return Promise.resolve()

    return this.processBlock(blockIndex)
      .then(() => {
        console.log('Finished block', blockIndex)
        return this.manager.setLastBlock(blockIndex)
      })
      .then(() => {
        if (blockIndex > secondPassOffset) {
          return this.processBlock(blockIndex - secondPassOffset)
            .then(() => {
              console.log('Second scan: Finished block', blockIndex - secondPassOffset)
              return this.manager.setLastBlock(blockIndex)
            })
        }
      })
      .then(first => this.processBlocks(blockIndex + 1, endBlockNumber)
      )
  }

  updateTransactions() {
    return this.manager.getLastBlock()
      .then((lastBlock:any) => this.client.getBlockNumber()
        .then((newLastBlock:any) => {
          console.log('Updating blocks (last - current)', lastBlock, newLastBlock)
          if (newLastBlock == lastBlock)
            return Promise.resolve()

          return this.processBlocks(lastBlock + 1, newLastBlock)
            .then(() => this.updatePending(newLastBlock - this.minimumConfirmations))
        })
      )
  }

}//end BlockScanner class
