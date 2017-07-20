import * as Web3 from 'web3'
import {getTransactions} from "../../../src/external-services/mambu/index";
import {getTransactionsByAccount, checkAllBalances} from './utility'
import BigNumber from 'bignumber.js';
const web3 = new Web3()


export interface EthereumTransaction {
  to: string
  from: string
  wei: string
  gas: string
}

export interface Web3EthereumClientConfig {
  http: string
}

export interface EthereumClient {
  createAddress(): Promise<string>
  getBalance(address: string): Promise<number>
  send(fromAddress: string, toAddress: string, value: string, gas?: string): Promise<EthereumTransaction>
  importAddress(address: string): Promise<void>
  listAllTransactions(): Promise<any[]>
  getAccounts(): Promise<string>
}

export interface AddressSource {
  generateAddress(): Promise<string>
}

export class PredefinedAddressSource implements AddressSource {
  private addresses: string[]
  private index: number = 0

  constructor(addresses: string[]) {
    this.addresses = addresses
  }

  generateAddress(): Promise<string> {
    return Promise.resolve(this.addresses[this.index++])
  }
}

export class RandomAddressSource implements AddressSource {
  generateAddress(): Promise<string> {
    return Promise.resolve('fake-eth-address-' + Math.floor((Math.random() * 100000) + 1))
  }
}

export interface PretendTransaction {
  wei: number
}

export interface PretendBlock {
  id: string
  transactions: PretendTransaction[]
}

export class MockEthereumClient implements EthereumClient {
  private addressSource: AddressSource
  private addresses: { key: string; value: number } = {}
  private blockchain: PretendBlock[]

  constructor(addressSource: AddressSource) {
    this.addressSource = addressSource
  }

  createAddress(): Promise<string> {
    return this.addressSource.generateAddress()
      .then(address => {
        this.addresses[address] = 0
        return Promise.resolve(address);
      })
  }

  getBalance(address: string): Promise<number> {
    return Promise.resolve(this.addresses[address])
  }

  send(fromAddress: string, toAddress: string, value: string, gas: string = "2100"): Promise<EthereumTransaction> {
    const fromBalance = new BigNumber(this.addresses[fromAddress])
    if (fromBalance.lessThan(value))
      throw new Error('not enough funds')

    const toBalance = new BigNumber(this.addresses[toAddress])
    this.addresses[fromAddress] = fromBalance.minus(new BigNumber(value))
    this.addresses[toAddress] = toBalance.plus(new BigNumber(value))

    return Promise.resolve({
      from: '',
      to: fromAddress, // Using sweep transactions as external transactions so to/from is backwards.
      wei: value,
      gas: gas
    })
  }


  listAllTransactions(): Promise<any[]> {
    throw new Error("Not yet implemented.")
  }

  toWei(amount: number) {
    return new BigNumber(amount).times(Math.pow(10, 18)).toString();
  }

  fromWei(amount: number) {
    return new BigNumber(amount).dividedBy(1000000000000000000).toString();
  }

  importAddress(address: string): Promise<void> {
    this.addresses[address] = 0
    return Promise.resolve()
  }

  getAccounts(): Promise<string> {
    throw new Error("Not implemented.")
  }
}

export class Web3EthereumClient implements EthereumClient {
  private client

  constructor(ethereumConfig: Web3EthereumClientConfig) {
    web3.setProvider(new web3.providers.HttpProvider(ethereumConfig.http))
  }

  getClient() {
    return this
  }

  getSweepAddress() {
    return Promise.resolve(web3.eth.coinbase)
  }

  toWei(amount: number) {
    return web3.toWei(amount)
  }

  fromWei(amount: number) {
    return new BigNumber(amount).dividedBy(1000000000000000000).toString();
  }

  createAddress(): Promise<string> {
    return Promise.resolve(web3.personal.newAccount())
  }

  getAccounts(): Promise<string> {
    return Promise.resolve(web3.eth.accounts)
  }

  getBalance(address: string): Promise<number> {
    return new Promise((resolve, reject) => {
      web3.eth.getBalance(address, (err, result) => {
        if (err)
          resolve(err)
        resolve(result)
      })
    })
  }

  send(fromAddress: string, toAddress: string, amount: string, gas: string = "21000"): Promise<EthereumTransaction> {
    if (fromAddress === '') {
      fromAddress = web3.eth.coinbase
    }
    web3.personal.unlockAccount(fromAddress)
    amount = web3.toHex(amount)
    const transaction = {from: fromAddress, to: toAddress, value: amount, gas: gas}
    return new Promise<any>((resolve, reject) => {
      web3.eth.sendTransaction(transaction, (err, address) => {
        if (err)
          reject('Error sending to: ' + address)
        resolve(transaction)
      })
    })
  }

  listAllTransaction(address: string, lastblock: number) {
    return getTransactionsByAccount(web3.eth, address, lastblock)
  }

  importAddress(address: string): Promise<void> {
    throw new Error("Not implemented")
  }
}
