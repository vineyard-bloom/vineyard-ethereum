import BigNumber from 'bignumber.js';
import {AddressSource, Block, EthereumClient, EthereumTransaction} from "./types";
import {BlockInfo, FullBlock, ExternalSingleTransaction as ExternalTransaction} from "vineyard-blockchain"

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
      this.coinbase = ""
    }

    getBalance(address:any) {
      return address.balance
    }

    getBlock(blockNumber:number, blocks: any[], cb:any) {
      return blocks[blockNumber]
    }

    blockNumber(blocks:any[]) {
      return new Promise((resolve:any, reject: any) => {
        resolve(blocks[blocks.length -1])
      })
    }

    getTransaction(txid:string, transactions: any) {
      return transactions[txid] 
    }
}

export class MockWeb3 {
  mockEth: MockEth
  constructor(mockEth: MockEth) {
    this.mockEth = mockEth
  }
}
/*
export class MockEthereumClient implements EthereumClient {
  private addressSource: AddressSource
  private addresses: { key: string; value: number } = {}
  private blocks: Block[] = []
  private txindex = 0
  private mockWeb3: MockWeb3
  constructor(addressSource: AddressSource, mockWeb3: MockWeb3) {
    this.mockWeb3 = mockWeb3
    this.addressSource = addressSource
    this.blocks.push({
      number: 0,
      transactions: [],
      timestamp: Math.floor(Date.now() / 1000),
      hash: 'tx-hash-' + this.txindex++

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

  getBlockIndex(): Promise<number> {
    return Promise.resolve(this.blocks.length - 1)
  }

  getActiveBlock(): Block {
    return this.blocks[this.blocks.length - 1]
  }

  getLastBlock(): Promise<BlockInfo> {
      return this.mockWeb3.mockEth.blockNumber(this.blocks).then((lastBlock: Block) => {
        return {
          id: lastBlock.hash,
          currency: "ethereum",
          hash: lastBlock.hash,
          index: lastBlock.number,
          timeMined: new Date(lastBlock.timestamp)
        }
      }) 
    }

  getTransaction(txid: string) {
    for (var block in this.blocks) {
      return this.mockWeb3.mockEth.getTransaction(txid, this.blocks[block].transactions) 
    }
  }

  getNextBlockInfo(previousBlock: BlockInfo): Promise<BlockInfo> {
    const nextBlockIndex = previousBlock ? previousBlock.index + 1 : 0  
    return this.mockWeb3.mockEth.getBlock(nextBlockIndex, this.blocks, (err: any, nextBlock: Block) => {
      return {
        hash: nextBlock.hash,
        index: nextBlock.number,
        timeMined: nextBlock.timestamp
      }
    })
   }

   async getTransactionStatus(txid: string): Promise<number> {
    return 0;
  }

   getFullBlock(block: BlockInfo): Promise<FullBlock<ExternalTransaction>> {
      return {
        hash: block.hash,
        index: block.number,
        timeMined: block.timestamp,
        transactions: block.transactions
      }
  }

  private minePreviousBlock(block: Block) {
    const reward = block.transactions.reduce((a, b) => a.plus(b.gas), new BigNumber(0))
      + this.toWei(5)
    this.addresses[''] = this.addresses[''].plus(reward)
  }

  generate(blockCount: number): Promise<void> {
    for (let i = 0; i < blockCount; ++i) {
      this.minePreviousBlock(this.getActiveBlock())
      this.blocks.push({
        hash: 'tx-hash-' + this.txindex++,
        number: this.blocks.length,
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
    const fromBalance = new BigNumber("100000000000000000")
    if (fromBalance.lessThan(new BigNumber(value).plus(gas)))
      throw new Error('Not enough funds')

    const toBalance = new BigNumber("0")
    this.addresses[fromAddress] = fromBalance.minus(new BigNumber(value))
    this.addresses[toAddress] = toBalance.plus(new BigNumber(value))

    const transaction = {
      txid: "txid" + this.txindex++,
      from: fromAddress,
      to: toAddress,
      amount: value,
      gas: gas,
      blockNumber: this.blocks.length - 1,
      timeReceived: Math.floor(Date.now() / 1000),
      confirmations: 11,
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

  getBlockNumber(): Promise<number> {
    return Promise.resolve(this.blocks.length - 1)
  }

  getGas(): Promise<number> {
    return Promise.resolve(21000)
  }
}
*/