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
  private minSweepAmount
  private gas

  constructor(minSweepAmount, ethereumManager: SweepManager, ethereumClient) {
    this.minSweepAmount = minSweepAmount
    this.manager = ethereumManager
    this.client = ethereumClient
  }

  private getSweepGas(): Promise<number> {
    return this.client.getGas()
      .then(gasPrice => this.gas = parseFloat(gasPrice))
  }

  private singleSweep(address): Promise<Bristle> {
    return this.client.getBalance(address)
      .then(balance => {
        if (balance > this.minSweepAmount) {
          return this.calculateSendAmount(balance)
            .then(sendAmount => {
              return this.client.send(address, this.client.sweepAddress, sendAmount)
                .then(txHash => {
                  console.log('Saving sweep: ', txHash)
                  return this.saveSweepRecord({
                    from: address,
                    to: this.client.sweepAddress,
                    status: 0,
                    txid: txHash,
                    amount: sendAmount
                  })
                })
            })
        }
      })
  }

  calculateSendAmount(amount: number): Promise<number> {
    if (this.gas === undefined) {
      return this.getSweepGas().then(gasPrice => amount - (gasPrice * 21000))
    }
    return Promise.resolve(amount - (this.gas * 21000))
  }

  saveSweepRecord(bristle: Bristle) {
    return this.manager.saveSweepRecord(bristle)
  }

  sweep() {
    console.log('Starting Ethereum sweep')
    return this.getSweepGas()
      .then(() => {
        return this.manager.getDustyAddresses()
          .then(addresses => {
            console.log('Dusty addresses', addresses.length, addresses)
            return promiseEach(addresses, address => this.singleSweep(address))
          })
      })
      .then(() => console.log('Finished Ethereum sweep'))
  }

}
