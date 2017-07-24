import {each as promiseEach} from 'promise-each2'
import BigNumber from 'bignumber.js'
import {gasWei, EthereumClient, GenericEthereumManager} from "./types";
import {getTransactionsFromRange} from "./utility";

export class EthereumTransactionMonitor<EthereumTransaction> {
  private ethereumClient: EthereumClient
  private minimumConfirmations: number = 2;
  private sweepAddress: string
  private manager: GenericEthereumManager<EthereumTransaction>

  constructor(model: GenericEthereumManager<EthereumTransaction>, ethereumClient: EthereumClient, sweepAddress: string) {
    this.manager = model
    this.ethereumClient = ethereumClient
    this.sweepAddress = sweepAddress
  }

  // scanAddress(address: string, lastBlock: number) {
  //   return this.ethereumClient.listAllTransactions(address, lastBlock)
  //     .then(transactions => {
  //       if (transactions.length == 0)
  //        return Promise.resolve()
  //
  //       const newLastBlock = transactions[transactions.length - 1].blockNumber.toString()
  //       this.manager.setLastBlock(newLastBlock)
  //       return promiseEach(transactions, tx => this.manager.saveTransaction(tx))
  //     })
  // }

  // sweep(): Promise<void> {
  //   return this.manager.getAddresses()
  //     .then(addresses => promiseEach(addresses, address => this.saveNewTransaction(address))
  //     )
  // }

  private resolveTransaction(transaction: EthereumTransaction): Promise<void> {
      return this.ethereumClient.getTransaction(transaction.hash)
        .then(result => {
          if(!result || !result.blockNumber) {this.manager.onDenial(result)}
          else {this.manager.onConfirm(result)}
        })
  }

  private updatePending(newLastBlock: number): Promise<void> {
    return this.manager.getResolvedTransactions(newLastBlock)
     .then(transactions=> promiseEach(transactions, transaction => this.resolveTransaction(transaction)))
  }

  updateTransactions() {
    return this.manager.getLastBlock()
      .then(lastBlock => this.ethereumClient.getBlockNumber()
        .then(newLastBlock => {
          if (newLastBlock == lastBlock)
            return Promise.resolve<void>()

          console.log('Scanning block', newLastBlock)

          return getTransactionsFromRange(this.ethereumClient, this.manager, lastBlock, newLastBlock)
            .then(transactions => transactions.length == 0
              ? Promise.resolve()
              : promiseEach(transactions, tx => {
                console.log('Saving transaction', tx.hash)
                return this.manager.saveTransaction(tx)
              })
            )
            .then(() => {
              console.log('Finished block', newLastBlock)
              return this.manager.setLastBlock(newLastBlock)
            })
            .then(() => this.updatePending(newLastBlock - 5))
        })
      )
  }
}

export class EthereumBalanceMonitor<EthereumTransaction> {
  private ethereumClient;
  private minimumConfirmations: number = 2;
  private sweepAddress: string
  private manager: GenericEthereumManager<EthereumTransaction>

  constructor(model: GenericEthereumManager<EthereumTransaction>, ethereumClient: EthereumClient, sweepAddress: string) {
    this.manager = model
    this.ethereumClient = ethereumClient
    this.sweepAddress = sweepAddress
  }

  private saveNewTransaction(address): Promise<void> {
    return this.ethereumClient.getBalance(address)
      .then((balance) => {
        return this.ethereumClient.send(address, this.sweepAddress, balance)
          .then(transaction => this.manager.saveTransaction(transaction))
      })
  }

  sweep(): Promise<void> {
    return this.manager.getAddresses()
      .then(addresses => promiseEach(addresses, address => this.saveNewTransaction(address)))
  }
}
