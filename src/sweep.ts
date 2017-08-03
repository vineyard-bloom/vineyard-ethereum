import {each as promiseEach} from 'promise-each2'
import {EthereumTransaction, SweepManager} from './types'
import BigNumber from 'bignumber.js';

export interface Bristle {
  from: string
  to: string
  status: number
  txid: string
  amount
}

export interface SweepConfig {
  sweepAddress: string,
  minSweepAmount
  gas
  gasPrice
}

export function gweiToWei(amount) {
  return amount.times("1000000000")
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
          const transaction = {
            from: address,
            to: this.config.sweepAddress,
            value: sendAmount,
            gas: this.config.gas,
            gasPrice: this.config.gasPrice,
          }
          console.log('Sweeping address', transaction)
          return this.client.send(transaction)
            .then(tx => {
              console.log('Sweeping address succeeded', tx.hash)
              return this.saveSweepRecord({
                from: address,
                to: this.config.sweepAddress,
                status: 0,
                txid: tx.hash,
                amount: sendAmount
              })
            })
        }
      })
  }

  calculateSendAmount(amount) {
    const gasPrice = gweiToWei(new BigNumber(this.config.gasPrice))
    const gasTotal = new BigNumber(this.config.gas).times(gasPrice)
    return amount.minus(gasTotal)
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
