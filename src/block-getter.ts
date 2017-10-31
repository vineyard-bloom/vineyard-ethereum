import { EthereumClient, EthereumTransaction, GenericEthereumManager } from './types'
import { BlockInfo, FullBlock } from 'vineyard-blockchain'






  export function getFullBlock(block: BlockInfo): Promise<FullBlock> {

  }

  export function getNextFullBlock(block: BlockInfo): Promise<FullBlock> {
    // return getTransactions(this.ethereumClient, this.manager, blockIndex)
    //   .then(transactions => {
    //     console.log('Scanning block', blockIndex, 'tx-count:', transactions.length)
    //     return transactions.length == 0
    //       ? Promise.resolve()
    //       : promiseEach(transactions, tx => {
    //         console.log('Saving transaction', tx.hash)
    //         return this.manager.saveTransaction(tx, blockIndex)
    //       })
    //   })
  }

