import { each as promiseEach } from 'promise-each2'
import { EthereumClient, EthereumTransaction, GenericEthereumManager} from './types'
import { isTransactionValid } from './utility'

//more strongly typed eventually
export type TransactionFilter = (transaction) => Promise<boolean>
export type TransactionMap = (transaction) => Promise<EthereumTransaction>

export class BlockScanner<Transaction extends EthereumTransaction> {
  private client: EthereumClient
  private minimumConfirmations: number = 13
  private manager

  constructor(model, client: EthereumClient, minimumConfirmations: number = 13) {
    this.client = client
    this.manager = model
    this.minimumConfirmations = minimumConfirmations
  }

  private resolveTransaction(transaction): Promise<any> {
  console.log('RESOLVING TRANSACTION: ', transaction.txid)
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
    }).catch(e => {console.error(e)})
  }

  private updatePending(newLastBlock: number): Promise<void> {
    return this.manager.getResolvedTransactions(newLastBlock)
      .then(transactions => {
        promiseEach(transactions, transaction => this.resolveTransaction(transaction))})
      .catch(e => {console.error(e)})
  }

  gatherTransactions(block, transactions): Promise<any[]> {
      return this.manager.filterSaltTransactions(transactions)
      .then(saltTransactions => this.manager.filterAccountAddresses(saltTransactions))
      .then(databaseAddresses => databaseAddresses.map(tx => this.manager.mapTransaction(tx, block))
    )}

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

  processBlock(blockIndex): Promise<void> {
    return this.getTransactions(blockIndex)
      .then(transactions => {
        console.log('Scanning block', blockIndex, 'tx-count:', transactions.length)
        return transactions.length == 0
          ? Promise.resolve()
          : promiseEach(transactions, tx => this.manager.saveTransaction(tx, blockIndex))
      })
  }

  processBlocks(blockIndex, endBlockNumber): Promise<void> {
    const secondPassOffset = 5

    if (blockIndex > endBlockNumber)
      return Promise.resolve<void>()
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
      .then(lastBlock => this.client.getBlockNumber()
        .then(newLastBlock => {
          console.log('Updating blocks (last - current)', lastBlock, newLastBlock)
          if (newLastBlock == lastBlock)
            return Promise.resolve<void>()

          return this.processBlocks(lastBlock + 1, newLastBlock)
            .then(() => this.updatePending(newLastBlock - this.minimumConfirmations))
        })
      )
  }

}//end BlockScanner class
