import {each as promiseEach} from 'promise-each2'
import BigNumber from 'bignumber.js'
import {gasWei, EthereumClient} from "./types";

export interface GenericEthereumManager<EthereumTransaction> {
  getAddresses(): Promise<string[]>
  saveTransaction(transaction: EthereumTransaction)
  getLastBlock(): Promise<string>
  setLastBlock(lastblock: string): Promise<void>
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
      .then(balance => {
          if (balance === undefined)
            throw new Error('No account found with address: ' + address)

          if (balance.equals(0))
            return Promise.resolve()

          return this.ethereumClient.send(address, this.sweepAddress, new BigNumber(balance) - gasWei)
            .then(sweepTransaction => {
              return this.manager.getLastBlock()
                .then(lastblock => {
                  if (typeof lastblock !== 'string' && typeof lastblock !== 'number')
                    lastblock = '0'

                  this.ethereumClient.listAllTransactions(address, parseInt(lastblock))
                    .then(transactions => {
                      if (transactions.length == 0)
                        throw new Error("Could not find transactions for sweep.")

                      const newLastBlock = transactions[transactions.length - 1].blockNumber.toString()
                      this.manager.setLastBlock(newLastBlock)

                      return promiseEach(transactions, tx => {
                        this.manager.saveTransaction(tx)
                      })
                    })
                })
            })
        }
      )
  }

  sweep(): Promise<void> {
    return this.manager.getAddresses()
      .then(addresses => promiseEach(addresses, address => this.saveNewTransaction(address))
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
