import {EthereumClient} from './ethereum-client'
import {each as promiseEach} from 'promise-each2'

export interface GenericEthereumManager<Transaction> {
  getAddresses(): Promise<string[]>
  saveTransaction(transaction: Transaction)
  getLastBlock(): Promise<number>
}

export class EthereumTransactionMonitor<Transaction> {
  private ethereumClient;
  private minimumConfirmations: number = 2;
  private sweepAddress: string
  private manager: GenericEthereumManager<Transaction>

  constructor(model: GenericEthereumManager<Transaction>, ethereumClient: EthereumClient, sweepAddress: string) {
    this.manager = model
    this.ethereumClient = ethereumClient
    this.sweepAddress = sweepAddress
  }

  private saveNewTransaction(address): Promise<void> {
    return this.ethereumClient.getBalance(address)
      .then((balance) => {
        return this.ethereumClient.send(address, this.sweepAddress, balance)
          .then(transaction => {
            return this.manager.getLastBlock()
              .then(lastblock => {
                return this.ethereumClient.listAllTransactions(address, lastblock)
                  .then(transactions => {
                    return promiseEach(transactions, tx => {
                      this.manager.saveTransaction(transaction)
                    })
                  })
              })
          })
      })
  }

  sweep(): Promise<void> {
    return this.manager.getAddresses()
      .then(addresses => promiseEach(addresses, address => this.saveNewTransaction(address))
      )
  }
}