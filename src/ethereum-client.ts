import * as Web3 from 'web3'
import {getTransactionsFromRange} from './utility'
import BigNumber from 'bignumber.js';
import {AddressManager, Block, EthereumClient, EthereumTransaction} from "./types";

export interface Web3EthereumClientConfig {
  http: string
  sweepAddress: string
}

export class Web3EthereumClient implements EthereumClient {
  private client
  private web3

  constructor(ethereumConfig: Web3EthereumClientConfig) {
    this.web3 = new Web3()
    this.web3.setProvider(new this.web3.providers.HttpProvider(ethereumConfig.http))
  }

  getClient() {
    return this
  }

  getTransaction(txid: number) {
    return this.web3.eth.getTransaction(txid, function(error, result) {
      return result
    })
  }

  getSweepAddress() {
    return Promise.resolve(this.web3.eth.coinbase)
  }

  toWei(amount: number) {
    return this.web3.toWei(amount)
  }

  fromWei(amount: number) {
    return new BigNumber(amount).dividedBy(1000000000000000000).toString();
  }

  createAddress(): Promise<string> {
    return Promise.resolve(this.web3.personal.newAccount())
  }

  getAccounts(): Promise<string> {
    return Promise.resolve(this.web3.eth.accounts)
  }

  getBalance(address: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.web3.eth.getBalance(address, (err, result) => {
        if (err)
          resolve(err)
        resolve(result)
      })
    })
  }

  send(fromAddress: string, toAddress: string, amount: string, gas: string = "21000"): Promise<EthereumTransaction> {
    if (fromAddress === '') {
      fromAddress = this.web3.eth.coinbase
    }
    this.web3.personal.unlockAccount(fromAddress)
    amount = this.web3.toHex(amount)
    const transaction = {from: fromAddress, to: toAddress, value: amount, gas: gas}
    return new Promise<any>((resolve, reject) => {
      this.web3.eth.sendTransaction(transaction, (err, address) => {
        if (err)
          reject('Error sending to ' + address + ": " + err)
        else
          resolve(transaction)
      })
    })
  }

  // listAllTransactions(addressManager: AddressManager, lastBlock: number): Promise<EthereumTransaction[]> {
  //   return getTransactionsFromRange(this.web3.eth, lastBlock, addressManager)
  // }

  importAddress(address: string): Promise<void> {
    throw new Error("Not implemented")
  }

  generate(blockCount: number): Promise<void> {
    throw new Error("Not implemented.")
  }

  getBlock(blockIndex: number): Promise<Block> {
    return new Promise((resolve, reject) => {
      this.web3.eth.getBlock(blockIndex, true, (err, block) => {
        if (err) {
          console.error('Error processing ethereum block', blockIndex, 'with message', err.message)
          reject(new Error(err));
        }
        else {
          resolve(block)
        }
      })
    })
  }

  getBlockNumber(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.web3.eth.getBlockNumber((err, blockNumber) => {
        if (err) {
          console.error('Error processing ethereum block number', blockNumber, 'with message', err.message)
          reject(new Error(err));
        }
        else {
          resolve(blockNumber)
        }
      })
    })
  }

  getGas(): Promise<number> {
    return this.web3.eth.getGasPrice((err, result) {
      if(err)
        return Promise.reject(err)
      return Promise.resolve(result)
    })
  }
}
