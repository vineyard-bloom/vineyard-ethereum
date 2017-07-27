import {each as promiseEach} from 'promise-each2'
import { GenericEthereumManager, EthereumTransaction } from './types'



export interface Bristle {
  from: string
  to: string
  status: number
  txid: string
  amount: number
}

export class Broom {
  private minSweepAmount: number
  private sweepGas: number
  private sweepAddress: string
  private manager: GenericEthereumManager<EthereumTransaction>
  private client

  constructor(minSweepAmount, ethereumManager: GenericEthereumManager<EthereumTransaction>, ethereumClient) {
    this.minSweepAmount = minSweepAmount
    this.sweepAddress = ethereumClient.sweepAddress
    this.manager = ethereumManager
    this.client = ethereumClient
  }

  private getSweepGas():Promise<number> {
    return this.client.getGas()
      .then(gasPrice => this.sweepGas = parseFloat(gasPrice))
      .catch(err => err)
  }

  private singleSweep(address):Promise<Bristle> {
    return this.client.getBalance(address)
      .then(balance => {
        if(balance > this.minSweepAmount) {
          return this.calculateSendAmount(balance)
            .then(sendAmount => {
              return this.client.send(address, this.sweepAddress, sendAmount)
                .then(txHash => this.saveSweepRecord({ from: address, to: this.sweepAddress, status: 0, txid: txHash, amount: sendAmount }))
            })
        }
      })
      .catch(err => err)
  }

  calculateSendAmount(amount:number):Promise<number> {
    if(this.sweepGas === undefined) {
      return this.getSweepGas().then(gasPrice => amount - (gasPrice * 21000))
    }
    return Promise.resolve(amount - (this.sweepGas * 21000))
  }

  saveSweepRecord(bristle: Bristle) {
    return this.manager.saveSweepRecord(bristle)
      .then(() => this.manager.saveTransaction(bristle))
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
