import BigNumber from 'bignumber.js';
import {AddressSource, Block, EthereumClient, EthereumTransaction} from "./types";

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
  private blocks: Block[] = []
  private txindex = 0

  constructor(addressSource: AddressSource) {
    this.addressSource = addressSource
    this.blocks.push({
      id: 0,
      transactions: [],
      timestamp: Math.floor(Date.now() / 1000),
    })
    this.addresses[''] = new BigNumber("10000000000000000000000000000")
  }

  createAddress(): Promise<string> {
    return this.addressSource.generateAddress()
      .then(address => {
        this.addresses[address] = new BigNumber(0)
        return Promise.resolve(address);
      })
  }

  getActiveBlock(): Block {
    return this.blocks[this.blocks.length - 1]
  }

  private minePreviousBlock(block: Block) {
    const reward = block.transactions.reduce((a, b) => a + b.gas, new BigNumber(0))
      + this.toWei(5)
    this.addresses[''] = this.addresses[''].plus(reward)
  }

  generate(blockCount: number): Promise<void> {
    for (let i = 0; i < blockCount; ++i) {
      this.minePreviousBlock(this.getActiveBlock())
      this.blocks.push({
        id: this.blocks.length,
        transactions: [],
        timestamp: Math.floor(Date.now() / 1000),
      })
    }

    return Promise.resolve()
  }

  getBalance(address: string): Promise<number> {
    return Promise.resolve(this.addresses[address])
  }

  send(fromAddress: string, toAddress: string, value: string, gas: string = "2100"): Promise<EthereumTransaction> {
    const fromBalance = new BigNumber(this.addresses[fromAddress])
    if (fromBalance.lessThan(new BigNumber(value).plus(gas)))
      throw new Error('Not enough funds')

    const toBalance = new BigNumber(this.addresses[toAddress])
    this.addresses[fromAddress] = fromBalance.minus(new BigNumber(value))
    this.addresses[toAddress] = toBalance.plus(new BigNumber(value))

    const transaction = {
      from: fromAddress,
      to: toAddress,
      value: value,
      gas: gas,
      blockNumber: this.blocks.length - 1,
      // time: Math.floor(Date.now() / 1000),
      hash: 'tx-hash-' + this.txindex++ //this.blocks.length + '.' + this.getActiveBlock().transactions.length
    }

    this.getActiveBlock().transactions.push(transaction)

    return Promise.resolve(transaction)
  }

  toWei(amount: number) {
    return new BigNumber(amount).times(Math.pow(10, 18)).toString();
  }

  fromWei(amount: number) {
    return new BigNumber(amount).dividedBy(1000000000000000000).toString();
  }

  importAddress(address: string): Promise<void> {
    this.addresses[address] = new BigNumber(0)
    return Promise.resolve()
  }

  getAccounts(): Promise<string> {
    throw new Error("Not implemented.")
  }

  getBlock(blockIndex: number): Promise<Block> {
    return Promise.resolve(this.blocks [blockIndex])
  }

  getBlockNumber(): number {
    return this.blocks.length - 1
  }

  getGas(): Promise<number> {
    return Promise.resolve(21000)
  }
}
