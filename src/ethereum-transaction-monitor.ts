import {EthereumClient} from './ethereum-client'
import {each as promiseEach} from 'promise-each2'

export interface GenericEthereumManager<EthereumTransaction> {
  getAddresses(): Promise<string[]>
  saveTransaction(transaction: EthereumTransaction)
  getLastBlock(): Promise<string>
  setLastBlock(lastblock:string): Promise<void>
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

  private saveNewTransaction(address): Promise<void> {
    return this.ethereumClient.getBalance(address)
      .then((balance) => {
        if(balance === undefined) {
          console.error('No account found with address: ', address)
        } else {
          return this.ethereumClient.send(address, this.sweepAddress, balance)
            .then(transaction => {
              return this.manager.getLastBlock()
                .then(lastblock => {

                  return this.ethereumClient.listAllTransactions(address, parseInt(lastblock))
                    .then(transactions => {
                      const newLastBlock = transactions[transactions.length - 1].blockNumber.toString()
                      this.manager.setLastBlock(newLastBlock)

                      return promiseEach(transactions, tx => {
                        this.manager.saveTransaction(transaction)
                      })
                    })
                })
            })
        }
      })
  }

  sweep(): Promise<void> {
    return this.manager.getAddresses()
      .then(addresses => promiseEach(addresses, address => this.saveNewTransaction(address))
      )
  }
}

export class EthereumBalanceMonitor<EthereumTransaction>  {
  private ethereumClient;
  private minimumConfirmations: number = 2;
  private sweepAddress: string
  private manager: GenericEthereumManager<EthereumTransaction> 

  constructor(model: GenericEthereumManager<EthereumTransaction> , ethereumClient: EthereumClient, sweepAddress: string) {
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
