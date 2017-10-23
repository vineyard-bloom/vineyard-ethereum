import { each as promiseEach } from 'promise-each2'
import { EthereumClient, EthereumTransaction, GenericEthereumManager} from './types';

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
  return this.client.getTransaction(transaction.txid)
    .then(result => {
      if (!result || !result.blockNumber) {
        console.log('Denying transaction', result)
        return this.manager.setStatus(transaction, 2)
          .then(() => this.manager.onDenial(transaction))
      }
      else {
        console.log('Confirming transaction', result)
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

  createTransaction(data, block) {
    return {
      blockHash: data.transaction.blockHash,
      blockNumber: data.transaction.blockNumber,
      contractAddress: data.transaction.to,
      from: data.transaction.from,
      gas: data.transaction.gasUsed,
      gasPrice: data.transaction.gasPrice,
      hash: data.transaction.hash,
      input: data.transaction.input,
      nonce: data.transaction.nonce,
      time: new Date(block.timestamp * 1000),
      to: data.to,
      transactionIndex: data.transaction.transactionIndex,
      value: data.value

    }
  }

  getTransactionData(transactions){
    // return promiseEach(transactions, txid => this.client.getTransaction(txid))
    return Promise.resolve(transactions.map(tx => this.client.getTransaction(tx)))
  }

  gatherTransactions(block, transactions): Promise<any[]> {
    return this.getTransactionData(transactions)
      .then(txs => this.manager.filterSaltTransactions(txs)
      .then(result => this.manager.filterAccountAddresses(result)
      .then(result2 => result2.map(tx => this.createTransaction(tx, block))))
    )}

  getTransactions(i: number): Promise<any[]> {
    return this.client.getBlock(i)
      .then(block => {
        if (!block || !block.transactions)
          return Promise.resolve([])
        console.log('***BLOCK.TRANSACTIONS', block.transactions)
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
    console.log('Starting Block Scanner')
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
