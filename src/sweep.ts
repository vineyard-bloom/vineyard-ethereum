import {each as promiseEach} from 'promise-each2'
import {EthereumTransaction, SweepManager} from './types'

export interface Bristle {
  from: string
  to: string
  status: number
  txid: string
  amount: number
}

export interface SweepConfig {
  sweepAddress: string,
  minSweepAmount: number
  gas
}

export class Broom {
  private manager: SweepManager
  private client
  private config: SweepConfig

  constructor(config: SweepConfig, ethereumManager: SweepManager, ethereumClient) {
    this.config = config
    this.manager = ethereumManager
    this.client = ethereumClient
  }

  private getSweepGas(): Promise<number> {
    return this.client.getGas()
      .then(gasPrice => this.config.gas = parseFloat(gasPrice))
      .catch(err => err)
  }

  private singleSweep(address): Promise<Bristle> {
    return this.client.getBalance(address)
      .then(balance => {
        if (balance > this.config.minSweepAmount) {
          return this.calculateSendAmount(balance)
            .then(sendAmount => {
              return this.client.send(address, this.config.sweepAddress, sendAmount)
                .then(txHash => this.saveSweepRecord({
                  from: address,
                  to: this.config.sweepAddress,
                  status: 0,
                  txid: txHash,
                  amount: sendAmount
                }))
            })
        }
      })
      .catch(err => err)
  }

  calculateSendAmount(amount: number): Promise<number> {
    if (this.config.gas === undefined) {
      return this.getSweepGas().then(gasPrice => amount - (gasPrice * 21000))
    }
    return Promise.resolve(amount - (this.config.gas * 21000))
  }

  saveSweepRecord(bristle: Bristle) {
    return this.manager.saveSweepRecord(bristle)
  }

  sweep() {
    return this.getSweepGas()
      .then(() => {
        return this.manager.getDustyAddresses()
          .then(addresses => promiseEach(addresses, address => this.singleSweep(address)))
      })
  }

}
