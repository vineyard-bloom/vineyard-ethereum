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

  // sweep(): Promise<void> {
  //   return this.manager.getAddresses()
  //     .then(addresses => promiseEach(addresses, address => this.saveNewTransaction(address))
  //     )
  // }

  updateTransactions() {
    return this.manager.getLastBlock()
      .then(lastBlock => getTransactionsFromRange(this.ethereumClient, this.manager, lastBlock)
        .then(transactions => {
          if (transactions.length == 0)
            return Promise.resolve()

          this.manager.setLastBlock(lastBlock)
          return promiseEach(transactions, tx => this.manager.saveTransaction(tx))
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
