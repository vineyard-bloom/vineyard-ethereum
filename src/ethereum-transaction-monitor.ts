import {each as promiseEach} from 'promise-each2'
import BigNumber from 'bignumber.js'
import {gasWei, EthereumClient} from "./types";

export interface GenericEthereumManager<EthereumTransaction> {
  getAddresses(): Promise<string[]>
  saveTransaction(transaction: EthereumTransaction)
  getLastBlock(): Promise<number>
  setLastBlock(lastblock: number): Promise<void>
  saveSweepRecord(transaction): Promise<any>
}

export class EthereumTransactionMonitor<EthereumTransaction> {
  private ethereumClient;
  private minimumConfirmations: number = 2;
  private sweepAddress: string
  private manager: GenericEthereumManager<EthereumTransaction>

  constructor(model: GenericEthereumManager<EthereumTransaction>, ethereumClient: EthereumClient, sweepAddress: string) {
    this.manager = model
    this.ethereumClient = ethereumClient
    this.sweepAddress = sweepAddress
  }

  scanAddress(address: string, lastBlock: number) {
    return this.ethereumClient.listAllTransactions(address, lastBlock)
      .then(transactions => {
        if (transactions.length == 0)
         return Promise.resolve()

        const newLastBlock = transactions[transactions.length - 1].blockNumber.toString()
        this.manager.setLastBlock(newLastBlock)
        return promiseEach(transactions, tx => this.manager.saveTransaction(tx))
      })
  }

  // sweep(): Promise<void> {
  //   return this.manager.getAddresses()
  //     .then(addresses => promiseEach(addresses, address => this.saveNewTransaction(address))
  //     )
  // }

  updateTransactions() {
    return this.manager.getLastBlock()
      .then(lastBlock => {
        return this.manager.getAddresses()
          .then(addresses => promiseEach(addresses, address => this.scanAddress(address, lastBlock)))
      })
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
