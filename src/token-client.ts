import { BaseBlock, blockchain, ReadClient } from 'vineyard-blockchain'
import { Web3EthereumClientConfig } from './ethereum-client'
import { Block, EthereumTransaction, Web3TransactionReceipt } from './types'
import {
  getBlock, getBlockIndex, getFullBlock, getLastBlock, getNextBlockInfo, getTransactionReceipt,
  getTransactionStatus, SendTransaction, sendWeb3Transaction, Web3Client
} from './client-functions'
import { initializeWeb3 } from './utility'

const Web3 = require('web3')
const SolidityCoder = require('web3/lib/solidity/coder.js')

export interface AbiObject {
  name: string
  type: string
  inputs: AbiObject[]
}

export class TokenClient implements ReadClient<blockchain.ContractTransaction> {
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

  async send(transaction: SendTransaction): Promise<EthereumTransaction> {
    return sendWeb3Transaction(this.web3, transaction)
  }

  async getBlockIndex(): Promise<number> {
    return getBlockIndex(this.web3)
  }

  async getLastBlock(): Promise<BaseBlock> {
    return getLastBlock(this.web3)
  }

  async getTransactionStatus(txid: string): Promise<blockchain.TransactionStatus> {
    return getTransactionStatus(this.web3, txid)
  }

  async getNextBlockInfo(blockIndex: number | undefined): Promise<BaseBlock | undefined> {
    return getNextBlockInfo(this.web3, blockIndex)
  }

  async getFullBlock(blockIndex: number): Promise<blockchain.FullBlock<blockchain.ContractTransaction>> {
    return getFullBlock(this.web3, blockIndex)
  }

  async getBlock(blockIndex: number): Promise<Block> {
    return getBlock(this.web3, blockIndex)
  }

  async getTransactionReceipt(txid: string): Promise<Web3TransactionReceipt> {
    return getTransactionReceipt(this.web3, txid)
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
