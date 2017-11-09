import {each as promiseEach} from 'promise-each2'
import {EthereumTransaction, SweepManager} from './types'
import BigNumber from 'bignumber.js';
import {TokenContract} from "../lab/token-contract";

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
  private tokenContract: TokenContract

  constructor(config: SweepConfig, ethereumManager: SweepManager, ethereumClient) {
    this.config = config
    this.manager = ethereumManager
    this.client = ethereumClient
    this.tokenContract = new TokenContract(this.client)
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

  tokenSweep(abi) {
    console.log('Starting Token sweep')
    return this.manager.getDustyAddresses()
      .then(addresses => {
        console.log('Dusty addresses', addresses.length, addresses)
        return promiseEach(addresses, address => this.tokenSingleSweep(abi, address))
      })
      .then(() => console.log('Finished Token sweep'))
  }

  tokenSingleSweep(abi, address) {
    return this.client.unlockAccunt(address)
        .then(() => this.tokenContract.getBalanceOf(abi, this.config.tokenContractAddress, address)
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
        )
  }

  needsGas(abi, address):Promise<boolean> {
    return this.client.unlockAccount(address)
      .then(() => this.tokenContract.getBalanceOf(abi, this.config.tokenContractAddress, address)
      .then(tokenBalance => this.client.getBalance(address)
      .then(ethBalance => parseFloat(tokenBalance) > 0 && ethBalance.toNumber() < 300000000000000)
      )
    )
  }

  gasTransaction(abi, address) {
    return this.needsGas(abi, address)
      .then(gasLess => {
        if(gasLess) {
          return this.client.send(this.config.hotWalletAddress, address, 0.0003)
        }
      })
  }

  provideGas(abi) {
    console.log('Starting Salt Gas Provider')
    return this.manager.getDustyAddresses()
      .then(addresses => {
        console.log('Dusty addresses', addresses.length, addresses)
        return promiseEach(addresses, address => this.gasTransaction(abi, address))
      })
      .then(() => console.log('Finished Salt Gas Provider job'))
  }
}
