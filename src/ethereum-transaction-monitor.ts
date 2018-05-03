import { each as promiseEach } from 'promise-each2'
import { EthereumClient, EthereumTransactionOld, GenericEthereumManager } from './types'
import { getTransactions } from './utility'

// EthereumTransactionMonitor is deprecated.  Use one of the monitors from vineyard-minotaur instead.

export class EthereumTransactionMonitor<Transaction extends EthereumTransactionOld> {
  private ethereumClient: EthereumClient
  private minimumConfirmations: number = 12
  private sweepAddress: string
  private manager: GenericEthereumManager<Transaction>

  constructor(model: GenericEthereumManager<Transaction>, ethereumClient: EthereumClient, sweepAddress: string,
              minimumConfirmations: number = 12) {
    this.manager = model
    this.ethereumClient = ethereumClient
    this.sweepAddress = sweepAddress
    this.minimumConfirmations = minimumConfirmations
  }

  processBlock(blockIndex: number): Promise<void> {
    return getTransactions(this.ethereumClient, this.manager, blockIndex)
      .then(transactions => {
        console.log('Scanning block', blockIndex, 'tx-count:', transactions.length)
        return transactions.length === 0
          ? Promise.resolve()
          : promiseEach(transactions, (tx: any) => {
            console.log('Saving transaction', tx.hash)
            return this.manager.saveTransaction(tx, blockIndex)
          })
      })
  }

  processBlocks(blockIndex: number, endBlockNumber: number): Promise<void> {
    const secondPassOffset = 5

    if (blockIndex > endBlockNumber) {
      return Promise.resolve()
    }
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
      .then(lastBlock => this.ethereumClient.getBlockNumber()
        .then(newLastBlock => {
          console.log('Updating blocks (last - current)', lastBlock, newLastBlock)
          if (newLastBlock === lastBlock) {
            return Promise.resolve()
          }

          return this.processBlocks(lastBlock + 1, newLastBlock)
            .then(() => this.updatePending(newLastBlock - this.minimumConfirmations))
        })
      )
  }

  private resolveTransaction(transaction: Transaction): Promise<any> {
    return this.ethereumClient.getTransaction((transaction as any).txid)
      .then((result: any) => {
        if (!result || !result.blockNumber) {
          console.log('Denying transaction', result.txid)
          return this.manager.setStatus(transaction, 2)
            .then(() => this.manager.onDenial(transaction))
        } else {
          console.log('Confirming transaction', result.txid)
          return this.manager.setStatus(transaction, 1)
            .then(() => this.manager.onConfirm(transaction))
        }
      })
  }

  private updatePending(newLastBlock: number): Promise<void> {
    return this.manager.getResolvedTransactions(newLastBlock)
      .then(transactions => promiseEach(transactions, (transaction: any) => this.resolveTransaction(transaction)))
  }
}

// export class EthereumBalanceMonitor<EthereumTransaction> {
//   private ethereumClient:any
//   private minimumConfirmations: number = 2;
//   private sweepAddress: string
//   private manager: GenericEthereumManager<EthereumTransaction>
//
//   constructor(model: GenericEthereumManager<EthereumTransaction>, ethereumClient: EthereumClient, sweepAddress: string) {
//     this.manager = model
//     this.ethereumClient = ethereumClient
//     this.sweepAddress = sweepAddress
//   }
//
//   private saveNewTransaction(address:string): Promise<void> {
//     return this.ethereumClient.getBalance(address)
//       .then((balance:any) => {
//         return this.ethereumClient.send(address, this.sweepAddress, balance)
//           .then((transaction:any) => this.manager.saveTransaction(transaction))
//       })
//   }
//
//   sweep(): Promise<void> {
//     throw new Error("getAddresses will need paging.")
//     return this.manager.getAddresses()
//       .then(addresses => promiseEach(addresses, address => this.saveNewTransaction(address)))
//   }
// }
