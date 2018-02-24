import {
  BaseBlock, BlockInfo, ExternalSingleTransaction as ExternalTransaction, FullBlock, ReadClient, Resolve,
  TransactionStatus
} from 'vineyard-blockchain/src/types'
import { Web3EthereumClientConfig } from './ethereum-client'
import { Block, GethTransaction, Web3TransactionReceipt } from './types'
import { Web3Client } from './client-functions'
import { initializeWeb3 } from './utility'

const Web3 = require('web3')
const SolidityCoder = require('web3/lib/solidity/coder.js')

export interface AbiObject {
  name: string
  type: string
  inputs: AbiObject[]
}

export class TokenClient implements ReadClient<ExternalTransaction> {
  private web3: Web3Client
  private tokenContractAddress: string
  private currency: number
  private methodIDs: { [key: string]: AbiObject } = {}
  private abi: AbiObject[]

  constructor(ethereumConfig: Web3EthereumClientConfig, currency: number, tokenContractAddress: string, abi: object, web3?: Web3Client) {
    this.web3 = initializeWeb3(ethereumConfig, web3)
    this.tokenContractAddress = tokenContractAddress
    this.currency = currency
    this.abi = this.addAbi(abi)
  }

  async getBlockIndex(): Promise<number> {
    return new Promise((resolve: Resolve<number>, reject) => {
      this.web3.eth.getBlockNumber((err: any, blockNumber: number) => {
        if (err) {
          console.error('Error processing ethereum block number', blockNumber, 'with message', err.message)
          reject(new Error(err))
        } else {
          resolve(blockNumber)
        }
      })
    })
  }

  async getLastBlock(): Promise<BaseBlock> {
    let lastBlock: Block = await this.getBlock(await this.getBlockNumber())
    return {
      hash: lastBlock.hash,
      index: lastBlock.number,
      timeMined: new Date(lastBlock.timestamp * 1000),
      currency: this.currency
    }
  }

  async getTransactionStatus(txid: string): Promise<TransactionStatus> {
    let transactionReceipt: Web3TransactionReceipt = await this.getTransactionReceipt(txid)
    return transactionReceipt.status.substring(2) === '0' ? TransactionStatus.rejected : TransactionStatus.accepted
  }

  async getNextBlockInfo(previousBlock: BlockInfo | undefined): Promise<BaseBlock | undefined> {
    const nextBlockIndex = previousBlock ? previousBlock.index + 1 : 0
    let nextBlock: Block = await this.getBlock(nextBlockIndex)
    if (!nextBlock) {
      return undefined
    }
    return {
      hash: nextBlock.hash,
      index: nextBlock.number,
      timeMined: new Date(nextBlock.timestamp * 1000),
      currency: this.currency
    }
  }

  async getFullBlock(block: BlockInfo): Promise<FullBlock<ExternalTransaction>> {
    let fullBlock = await this.getBlock(block.index)
    let blockHeight = await this.getBlockNumber()
    const filteredTransactions = this.filterTokenTransaction(fullBlock.transactions)
    const decodedTransactions = await this.decodeTransactions(filteredTransactions)
    const transactions = decodedTransactions.map(t => ({
      txid: t.hash,
      to: t.to,
      from: t.from,
      amount: t.value,
      timeReceived: new Date(fullBlock.timestamp * 1000),
      confirmations: blockHeight - block.index,
      block: t.blockNumber,
      status: t.status
    }))
    return {
      hash: fullBlock.hash,
      index: fullBlock.number,
      timeMined: new Date(fullBlock.timestamp * 1000),
      transactions: transactions
    }
  }

  async getBlock(blockIndex: number): Promise<Block> {
    return new Promise((resolve: Resolve<Block>, reject) => {
      this.web3.eth.getBlock(blockIndex, true, (err: any, block: Block) => {
        if (err) {
          console.error('Error processing ethereum block', blockIndex, 'with message', err.message)
          reject(new Error(err))
        } else {
          resolve(block)
        }
      })
    })
  }

  async getBlockNumber(): Promise<number> {
    return new Promise((resolve: Resolve<number>, reject) => {
      this.web3.eth.getBlockNumber((err: any, blockNumber: number) => {
        if (err) {
          console.error('Error processing ethereum block number', blockNumber, 'with message', err.message)
          reject(new Error(err))
        } else {
          resolve(blockNumber)
        }
      })
    })
  }

  async getTransactionReceipt(txid: string): Promise<Web3TransactionReceipt> {
    return new Promise((resolve: Resolve<Web3TransactionReceipt>, reject) => {
      this.web3.eth.getTransactionReceipt(txid, (err: any, transaction: Web3TransactionReceipt) => {
        if (err) {
          console.error('Error querying transaction', txid, 'with message', err.message)
          reject(err)
        } else {
          resolve(transaction)
        }
      })
    })
  }

  filterTokenTransaction(transactions: GethTransaction[]) {
    return transactions.filter(tx => {
      if (tx && tx.to) {
        return tx.to.toLowerCase() === this.tokenContractAddress.toLowerCase()
      }
    })
  }

  async decodeTransactions(transactions: any[]) {
    let decodedTransactions = []
    for (let t of transactions) {
      const transaction = await this.web3.eth.getTransactionReceipt(t.hash)
      if (transaction && transaction.blockNumber && transaction.status === '0x1') {
        let decoded = this.decodeTransaction(t)
        t.to = decoded.to
        t.value = decoded.value
        decodedTransactions.push(t)
      }
    }
    return decodedTransactions
  }

  decodeTransaction(transaction: any) {
    let transferTo
    let transferValue

    const decodedData = this.decodeMethod(transaction.input)
    if (decodedData) {
      const params = decodedData.params

      for (let i = 0; i < params.length; ++i) {
        if (params[i].name === '_to') {
          transferTo = params[i].value
        }
        if (params[i].name === '_value') {
          transferValue = params[i].value / 100000000
        }
      }
      return {
        to: transferTo,
        value: transferValue
      }
    } else {
      return {
        to: '',
        value: 0
      }
    }
  }

  decodeMethod(data: any) {
    const methodID = data.slice(2, 10)
    const abiItem = this.methodIDs[methodID]
    if (abiItem) {
      const params = abiItem.inputs.map((item: any) => item.type)
      let decoded = SolidityCoder.decodeParams(params, data.slice(10))
      return {
        name: abiItem.name,
        params: decoded.map((param: any, index: number) => {
          let parsedParam = param
          if (abiItem.inputs[index].type.indexOf('uint') !== -1) {
            parsedParam = new Web3().toBigNumber(param).toString()
          }
          return {
            name: abiItem.inputs[index].name,
            value: parsedParam,
            type: abiItem.inputs[index].type
          }
        })
      }
    }
  }

  addAbi(abiArray: any) {
    if (Array.isArray(abiArray)) {
      abiArray.map((abi) => {
        if (abi.name) {
          const signature = new Web3().sha3(abi.name + '(' + abi.inputs.map(function (input: any) {
            return input.type
          }).join(',') + ')')
          if (abi.type === 'event') {
            this.methodIDs[signature.slice(2)] = abi
          } else {
            this.methodIDs[signature.slice(2, 10)] = abi
          }
        }
      })
      return abiArray
    } else {
      throw new Error('Expected ABI array, got ' + typeof abiArray)
    }
  }
}
