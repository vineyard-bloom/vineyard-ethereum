import * as Web3 from 'web3'
import {getTransactions} from "../../../src/external-services/mambu/index";
const web3 = new Web3()
import {getTransactionsByAccount} from './utility'
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))

export interface EthereumTransaction {

}

export interface Web3EthereumClientConfig {
  http: string
}

export interface EthereumClient {
  createAddress(): Promise<string>
  getBalance(address: string): Promise<number>
  send(fromAddress: string, toAddress: string, value: number, gas?: number): Promise<EthereumTransaction>
  generate(address: string, amount: number): Promise<void>
  importAddress(address: string): Promise<void>
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

export class MockEthereumClient implements EthereumClient {
  private addressSource: AddressSource
  private addresses: { key: string; value: number } = {}

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

  generate(address: string, amount: number): Promise<void> {
    this.addresses[address] += amount
  }

  getBalance(address: string): Promise<number> {
    return Promise.resolve(this.addresses[address])
  }

  send(fromAddress: string, toAddress: string, value: number, gas: number = 2100): Promise<EthereumTransaction> {
    if (this.addresses[fromAddress] < value)
      throw new Error('not enough funds')

    this.addresses[fromAddress] -= value
    this.addresses[toAddress] += value

    return Promise.resolve({})
  }

  importAddress(address: string): Promise<void> {
    this.addresses[address] = 0
    return Promise.resolve()
  }
}

export class Web3EthereumClient implements EthereumClient {
  private client

  constructor(ethereumConfig: Web3EthereumClientConfig) {
    web3.setProvider(new web3.providers.HttpProvider(ethereumConfig.http))
  }

  getClient() {
    return this.client
  }

  toWei(amount: number) {
    return web3.toWei(amount)
  }

  fromWei(amount: number) {
    return amount * 1000000000000000000
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

  send(fromAddress: string, toAddress: string, amount: number, gas: number = 21000): Promise<EthereumTransaction> {
    web3.personal.unlockAccount(fromAddress)
    amount = web3.toHex(amount)
    const transaction = {from: fromAddress, to: toAddress, value: amount, gas: gas}
    return new Promise<any>((resolve, reject) => {
      web3.eth.sendTransaction(transaction, (err, address) => {
        if (err)
          console.error(err)
        reject('Error sending to: ' + address)
        resolve(transaction)
      })
    })
  }

  listAllTransaction(address: string, lastblock: number) {
    return getTransactionsByAccount(web3.eth, address, lastblock)
  }
  generate(address: string, amount: number): Promise<void> {
    throw new Error("Not implemented")
  }

  importAddress(address: string): Promise<void> {
    throw new Error("Not implemented")
  }
}
