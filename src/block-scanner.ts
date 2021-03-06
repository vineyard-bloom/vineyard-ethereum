import { each as promiseEach } from 'promise-each2'
import { EthereumClient, EthereumTransaction } from './types'
import { getEvents, isTransactionValid } from './utility'

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

  resolveTransaction(transaction): Promise<any> {
    console.log('RESOLVING TRANSACTION: ', transaction.txid)
    return isTransactionValid(this.client, transaction.txid)
      .then(result => {
        if (!result.isValid) {
          console.log('Denying transaction', transaction)
          return this.manager.setStatus(transaction, 2)
            .then(() => this.manager.onDenial(transaction))
        }
        else {
          return getEvents((this.client as any).web3, {
            fromBlock: result.receipt.blockNumber,
            toBlock: result.receipt.blockNumber,
          })
            .then((events: any) => {
              if (events.result.some(e => e.transactionHash == transaction.txid)) {
                console.log('Confirming transaction', transaction)
                return this.manager.setStatus(transaction, 1)
                  .then(() => this.manager.onConfirm(transaction))
              }
              else {
                console.log('Denying transaction at contract layer', transaction)
                return this.manager.setStatus(transaction, 2)
                  .then(() => this.manager.onDenial(transaction))
              }
            })
        }
      }).catch(e => {
        console.error('Error resolving transation: ', e)
      })
  }

  private updatePending(newLastBlock: number): Promise<void> {
    console.log('IN UPDATE PENDING')
    return this.manager.getResolvedTransactions(newLastBlock)
      .then(transactions => {
        console.log('RESOLVED TRANSACTIONS ', transactions)
        return promiseEach(transactions, transaction => this.resolveTransaction(transaction))
      })
      .catch(e => {
        console.error(e)
      })
  }

  gatherTransactions(block, transactions): Promise<any[]> {
    return this.manager.filterSaltTransactions(transactions)
      .then(saltTransactions => this.manager.filterAccountAddresses(saltTransactions))
      .then(databaseAddresses => databaseAddresses.map(tx => this.manager.mapTransaction(tx, block)))
      .catch(e => {
        console.error('ERROR GATHERING TRANSACTIONS: ', e)
      })
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

  processBlock(blockIndex): Promise<void> {
    return this.getTransactions(blockIndex)
      .then(transactions => {
        console.log('Scanning block', blockIndex, 'at', new Date(), 'tx-count:', transactions.length)
        return transactions.length == 0
          ? Promise.resolve()
          : promiseEach(transactions, tx => this.manager.saveTransaction(tx, blockIndex))
      })
  }

  processBlocks(blockIndex, endBlockNumber): Promise<void> {
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
    //lastBlock = what is recorded in db as blockchainstates.lastBlock
      .then(lastBlock => this.client.getBlockNumber()
        //newLastBlock = newest block on ethereum blockchain
          .then(newLastBlock => {
            console.log('Updating blocks (last - current)', lastBlock, newLastBlock)
            if (newLastBlock == lastBlock)
              return Promise.resolve<void>()

            return this.processBlocks(lastBlock + 1, newLastBlock)
              .then(() => {
                console.log('STARTING UPDATE PENDING, newLastBlock: ', newLastBlock)
                return this.updatePending(newLastBlock - this.minimumConfirmations)
              })
          })
      )
  }

}//end BlockScanner class
