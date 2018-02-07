import { each as promiseEach } from 'promise-each2'
import { SweepManager } from './types'
import BigNumber from 'bignumber.js'
import { TokenContract } from '../lab/token-contract'

export interface Bristle {
  from: string
  to: string
  status: number
  txid: string
  amount: any
}

export interface SweepConfig {
  sweepAddress: string,
  minSweepAmount: any
  gas: any
  gasPrice: any
  tokenContractAddress: string
}

export function gweiToWei(amount: any) {
  return amount.times('1000000000')
}

export class Broom {
  private manager: SweepManager
  private client: any
  private config: SweepConfig
  private tokenContract: TokenContract
  private gasTotal: any

  constructor(config: SweepConfig, ethereumManager: SweepManager, ethereumClient: any) {
    this.config = config
    this.manager = ethereumManager
    this.client = ethereumClient
    this.tokenContract = new TokenContract(this.client)
    this.gasTotal = this.getTotalGas()
  }

  getTotalGas() {
    const totalGwei = (new BigNumber(this.config.gas)).times(new BigNumber(this.config.gasPrice))
    return totalGwei
  }

  saveSweepRecord(bristle: Bristle) {
    return this.manager.saveSweepRecord(bristle)
  }

  sweep() {
    console.log('Starting Ethereum sweep')
    return this.manager.getDustyAddresses()
      .then(addresses => {
        console.log('Dusty addresses', addresses.length, addresses)
        return promiseEach(addresses, (address: any) => this.singleSweep(address))
      })
      .then(() => console.log('Finished Ethereum sweep'))
  }

  tokenSweep(abi: any) {
    console.log('Starting Token sweep')
    return this.manager.getDustyAddresses()
      .then(addresses => {
        console.log('Dusty addresses', addresses.length, addresses)
        return promiseEach(addresses, (address: any) => this.tokenSingleSweep(abi, address))
      })
      .then(() => console.log('Finished Token sweep'))
  }

  tokenSingleSweep(abi: any, address: string) {
    return this.tokenContract.getBalanceOf(abi, this.config.tokenContractAddress, address)
      .then(balance => {
        console.log('Sweeping address', address)
        return this.tokenContract.transfer(abi, this.config.tokenContractAddress, address, this.config.sweepAddress, balance.c[0])
          .then(tx => {
            console.log('Sweeping address succeeded', tx.hash)
            return this.saveSweepRecord({
              from: address,
              to: this.config.sweepAddress,
              status: 0,
              txid: tx.hash,
              amount: balance
            })
          })
      })
  }

  needsGas(abi: any, address: string): Promise<boolean> {
    return this.tokenContract.getBalanceOf(abi, this.config.tokenContractAddress, address)
      .then(tokenBalance => this.client.getBalance(address)
        .then((ethBalance: any) => parseFloat(tokenBalance) > 0 && ethBalance.toNumber() < 300000000000000)
      )
  }

  gasTransaction(abi: any, address: any) {
    return this.needsGas(abi, address)
      .then(gasLess => {
        if (gasLess) {
          return this.client.send(address, this.config.tokenContractAddress, 0.0003)
        }
      })
  }

  provideGas(abi: any) {
    console.log('Starting Salt Gas Provider')
    return this.manager.getDustyAddresses()
      .then(addresses => {
        console.log('Dusty addresses', addresses.length, addresses)
        return promiseEach(addresses, (address: string) => this.gasTransaction(abi, address))
      })
      .then(() => console.log('Finished Salt Gas Provider job'))
  }

  private singleSweep(address: any): Promise<Bristle> {
    return this.client.getBalance(address)
      .then((balance: any) => { // balance is a bigNumber
        const sendAmount = balance.minus(this.gasTotal)
        if (sendAmount.greaterThan(this.gasTotal)) {
          const transaction = {
            from: address,
            to: this.config.sweepAddress,
            value: sendAmount,
            gas: this.config.gas,
            gasPrice: this.config.gasPrice
          }
          console.log('Sweeping address', transaction)
          return this.client.sendTransaction(transaction)
            .then((tx: any) => {
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
        return Promise.resolve()
      })
  }
}
