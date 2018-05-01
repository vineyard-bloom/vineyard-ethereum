import { AddressSource } from './types'

// Everything in this file is deprecated.  Any similar functionality should be in the /lab directory.

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

export class MockEth {

  coinbase: string

  constructor() {
    this.coinbase = ''
  }

  getBalance(address: any) {
    return address.balance
  }

  getBlock(blockNumber: number, blocks: any[], cb: any) {
    return blocks[blockNumber]
  }

  blockNumber(blocks: any[]) {
    return new Promise((resolve: any, reject: any) => {
      resolve(blocks[blocks.length - 1])
    })
  }

  getTransaction(txid: string, transactions: any) {
    return transactions[txid]
  }
}

export class MockWeb3 {
  mockEth: MockEth

  constructor(mockEth: MockEth) {
    this.mockEth = mockEth
  }
}
