import * as Web3 from 'web3'
import {getTransactionsByAccount, checkAllBalances} from './utility'
import BigNumber from 'bignumber.js';
import {EthereumClient, EthereumTransaction} from "./types";

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
          reject('Error sending to: ' + address + "this is the error: " + err)
        else   
          resolve(transaction)
      })
    })
  }

  listAllTransactions(address: string, lastblock: number): Promise<EthereumTransaction[]> {
    return getTransactionsByAccount(this.web3.eth, address, lastblock)
  }

  importAddress(address: string): Promise<void> {
    throw new Error("Not implemented")
  }

  generate(blockCount: number): Promise<void> {
    throw new Error("Not implemented.")
  }
}
