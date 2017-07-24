import {each as promiseEach} from 'promise-each2'
import { GenericEthereumManager } from './ethereum-transaction-monitor'
import { EthereumTransaction } from './types'

export interface EthereumSweepConfig {
  minSweepAmount: number
  sweepAddress: string
}

export interface Bristle {
  from: string
  to: string
  account: string
  status: number
  txid: string
  blockIndex: number
  amount: number
}

export class Broom {
  private minSweepAmount: number
  private sweepGas: number
  private sweepAddress: string
  private manager: GenericEthereumManager<EthereumTransaction>
  private client

  constructor(ethereumConfig: EthereumSweepConfig, ethereumManager: GenericEthereumManager<EthereumTransaction>, ethereumClient) {
    this.minSweepAmount = ethereumConfig.minSweepAmount
    this.sweepAddress = ethereumConfig.sweepAddress
    this.manager = ethereumManager
    this.client = ethereumClient
  }

  private getSweepGas() {
    return this.client.getGas()
      .then(gasPrice => this.sweepGas = gasPrice)
      .catch(err => err)
  }

    private singleSweep(address):Promise<Bristle> {
      return this.client.getBalance(address)
        .then(balance => {
          if(balance > this.minSweepAmount) {
            return this.client.send(address, this.sweepAddress, this.calculateSendAmount)
            .then(txHash => this.saveSweepRecord(txHash))
          }
      })
      .catch(err => err)
  }

  calculateSendAmount(amount) {
    return amount - (this.sweepGas * 21000)
  }

  saveSweepRecord(txHash) {
    return this.client.getClient().getTransaction(txHash)
      .then(transaction => {
        return this.manager.saveSweepRecord(transaction:Bristle)
          .then(() => this.manager.saveTransaction(transaction))
      })
      .catch(err => err)
  }

  sweep() {
    return this.getSweepGas()
      .then(() => {
        return this.manager.getAddresses()
          .then(addresses => promiseEach(addresses, address => this.singleSweep(address) ))
      })
  }

}
