import {each as promiseEach} from 'promise-each2'
import {EthereumTransaction, SweepManager} from './types'
import BigNumber from 'bignumber.js';

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
  gasPrice
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

  private singleSweep(address): Promise<Bristle> {
    return this.client.getBalance(address)
      .then(balance => {
        if (balance.greaterThan(this.config.minSweepAmount)) {
          const sendAmount = this.calculateSendAmount(balance)
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

  calculateSendAmount(amount) {
    const gasTotal = new BigNumber(this.config.gas).times(new BigNumber(this.config.gasPrice))
    return amount.subtract(gasTotal)
  }

  saveSweepRecord(bristle: Bristle) {
    return this.manager.saveSweepRecord(bristle)
  }

  sweep() {
    console.log('Starting Ethereum sweep')
    return this.manager.getDustyAddresses()
      .then(addresses => {
        console.log('Dusty addresses', addresses.length, addresses)
        return promiseEach(addresses, address => this.singleSweep(address))
      })
      .then(() => console.log('Finished Ethereum sweep'))
  }

}
