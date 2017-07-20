import BigNumber from 'bignumber.js';
import {AddressSource, EthereumClient, EthereumTransaction} from "./types";

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
      from: fromAddress,
      to: toAddress,
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
