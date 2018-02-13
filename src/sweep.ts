import { each as promiseEach } from 'promise-each2'
import { SweepManager, EthereumTransaction } from './types'
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
  tokenContractAddress: string,
  hotWallet: string
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

  async tokenSweep(abi: any) {
    console.log('Starting Token sweep')
    await this.provideGas(abi)
    return this.manager.getDustyAddresses()
      .then(addresses => {
        console.log('Dusty token addresses', addresses.length, addresses)
        return promiseEach(addresses, (address: any) => this.tokenSingleSweep(abi, address))
      })
      .then(() => console.log('Finished Token sweep'))
  }

  tokenSingleSweep(abi: any, address: string) {
    return this.tokenContract.getBalanceOf(abi, this.config.tokenContractAddress, address)
      .then(balance => {
        console.log('Sweeping address', address)
        return this.client.unlockAccount(address).then(() => {
          return this.tokenContract.transfer(abi, this.config.tokenContractAddress, address, this.config.sweepAddress, balance.toNumber())
            .then(tx => {
              console.log('Sweeping address succeeded', tx)
              return this.saveSweepRecord({
                from: address,
                to: this.config.sweepAddress,
                status: 0,
                txid: tx,
                amount: balance
              })
            })
            .catch(e => {
              console.error('Error sweeping token: ', e.message)
              return new Error(e)
            })
        })
        .catch((e: any) => {
          console.error('Error getting token address balance: ', e.message)
          return new Error(e)
        })
      })
      .catch(e => {
        console.error('Error unlocking address in token sweep: ', e.message)
        return new Error(e)
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
        if (gasLess && this.config.hotWallet) {
          const tx = {
            from: this.config.hotWallet,
            to: address,
            value: this.client.toWei(0.0003),
            gas: this.config.gas,
            gasPrice: this.config.gasPrice
          }
          return this.client.sendTransaction(tx).then((result: EthereumTransaction) => {
            this.manager.saveGasTransaction({ address: result.to, txid: result.hash})
          })
        } else {
          Promise.resolve()
        }
      })
  }

  provideGas(abi: any) {
    console.log('Starting Token Gas Provider')
    return this.manager.getDustyAddresses()
      .then(addresses => {
        console.log('Dusty addresses', addresses.length, addresses)
        return promiseEach(addresses, (address: string) => this.gasTransaction(abi, address))
      })
      .then(() => console.log('Finished Token Gas Provider job'))
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
