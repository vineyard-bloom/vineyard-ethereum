import { checkAllBalances, initializeWeb3 } from './utility'
import BigNumber from 'bignumber.js'
import { Block, EthereumTransaction, EthereumTransactionOld, Web3TransactionReceipt } from './types'
import {
  blockchain, BaseBlock, BlockInfo, ExternalSingleTransaction as ExternalTransaction, FullBlock, ReadClient, Resolve
} from 'vineyard-blockchain'
import { convertStatus, SendTransaction, sendWeb3Transaction, unlockWeb3Account, Web3Client } from './client-functions'
import { isNullOrUndefined } from 'util'

const util = require('util')
const Web3 = require('web3')

export interface Web3EthereumClientConfig {
  http: string
  sweepAddress?: string
}

export class Web3EthereumClient implements ReadClient<ExternalTransaction> {
  private web3: Web3Client

  constructor(config: Web3EthereumClientConfig, web3?: Web3Client) {
    this.web3 = initializeWeb3(config, web3)
  }

  getWeb3() {
    return this.web3
  }

  getBlockIndex(): Promise<number> {
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
      timeMined: new Date(lastBlock.timestamp * 1000)
    }
  }

  async getNextBlockInfo(blockIndex: number | undefined): Promise<BaseBlock | undefined> {
    const nextBlockIndex = isNullOrUndefined(blockIndex) ? 0 : blockIndex + 1
    let nextBlock: Block = await this.getBlock(nextBlockIndex)
    if (!nextBlock) {
      return undefined
    }
    return {
      hash: nextBlock.hash,
      index: nextBlock.number,
      timeMined: new Date(nextBlock.timestamp * 1000)
    }
  }

  async getFullBlock(blockIndex: number): Promise<FullBlock<ExternalTransaction>> {
    let fullBlock = await this.getBlock(blockIndex)
    // let blockHeight = await this.getBlockNumber()
    const transactions = fullBlock.transactions.map(t => ({
      txid: t.hash,
      to: t.to,
      from: t.from,
      amount: t.value,
      timeReceived: new Date(fullBlock.timestamp * 1000),
      // confirmations: blockHeight - block.index,
      blockIndex: blockIndex,
      status: convertStatus(t.status)
    }))
    return {
      hash: fullBlock.hash,
      index: fullBlock.number,
      timeMined: new Date(fullBlock.timestamp * 1000),
      transactions: transactions
    }
  }

  async getTransactionStatus(txid: string): Promise<blockchain.TransactionStatus> {
    let transactionReceipt: Web3TransactionReceipt = await this.getTransactionReceipt(txid)
    return transactionReceipt.status.substring(2) === '0' ? blockchain.TransactionStatus.rejected : blockchain.TransactionStatus.accepted
  }

  unlockAccount(address: string) {
    return unlockWeb3Account(this.web3, address)
  }

  send(from: string | object, to?: string, amount?: string): Promise<EthereumTransactionOld> {
    const transaction = from && typeof from === 'object'
      ? from as any
      : { from: from, to: to, value: amount, gas: 21000 }

    if (!transaction.from) {
      throw Error('Ethereum transaction.from cannot be empty.')
    }

    if (!transaction.to) {
      throw Error('Ethereum transaction.to cannot be empty.')
    }

    if (transaction.from === '') {
      transaction.from = this.web3.eth.coinbase
    }

    const original = Object.assign({}, transaction)
    transaction.value = transaction.value.toString()
    transaction.gasPrice = this.web3.toWei(transaction.gasPrice, 'gwei')
    return this.unlockAccount(transaction.from)
      .then(() => {
        // const hexAmount = this.web3.toHex(amount)
        return new Promise<any>((resolve: Resolve<EthereumTransactionOld>, reject) => {
          this.web3.eth.sendTransaction(transaction, (err: any, txid: string) => {
            if (err) {
              console.log('Error sending (original)', original)
              reject('Error sending to ' + to + ': ' + err)
            } else {
              console.log('Sent Ethereum transaction', txid, this.web3.eth.getTransaction(txid))
              transaction.hash = txid
              resolve(transaction)
            }
          })
        })
      })
  }

  getTransactionReceipt(txid: string): Promise<Web3TransactionReceipt> {
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

  getTransaction(txid: string): Promise<ExternalTransaction> {
    return new Promise((resolve: Resolve<ExternalTransaction>, reject) => {
      this.web3.eth.getTransaction(txid, (err: any, transaction: ExternalTransaction) => {
        if (err) {
          console.error('Error querying transaction', txid, 'with message', err.message)
          reject(err)
        } else {
          resolve(transaction)
        }
      })
    })
  }

  getCoinbase() {
    return Promise.resolve(this.web3.eth.coinbase)
  }

  toWei(amount: number) {
    return this.web3.toWei(amount)
  }

  fromWei(amount: number) {
    return new BigNumber(amount).dividedBy(1000000000000000000).toString()
  }

  createAddress(checksum: boolean = false): Promise<string> {
    return new Promise((resolve: Resolve<string>, reject) => {
      // if (!this.web3.isConnected()) {
      //   reject(new Error("Cannot create address, not connected to client."))
      // }

      this.web3.personal.newAccount((err: any, result: string) => {
        if (err) {
          reject(new Error('Error creating address: ' + err.message))
        } else {
          console.log('Created new address', result)
          if (checksum) {
            resolve(this.web3.toChecksumAddress(result))
          } else {
            resolve(result)
          }
        }
      })
    })
  }

  getAccounts(): Promise<string[]> {
    return new Promise((resolve: Resolve<string[]>, reject) => {
      this.web3.eth.getAccounts((err: any, result: string[]) => {
        if (err) {
          reject(new Error('Error getting accounts: ' + err.message))
        } else {
          resolve(result)
        }
      })
    })
  }

  getBalance(address: string): Promise<string> {
    return new Promise((resolve: Resolve<string>, reject) => {
      this.web3.eth.getBalance(address, (err: any, result: string) => {
        if (err) {
          reject(new Error('Error getting balance: ' + err.message))
        } else {
          resolve(result)
        }
      })
    })
  }

  // listAllTransactions(addressManager: AddressManager, lastBlock: number): Promise<EthereumTransaction[]> {
  //   return getTransactionsFromRange(this.web3.eth, lastBlock, addressManager)
  // }

  importAddress(address: string): Promise<void> {
    throw new Error('Not implemented')
  }

  generate(blockCount: number): Promise<void> {
    throw new Error('Not implemented.')
  }

  checkAllBalances(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(checkAllBalances(this.web3))
    })
  }

  getBlock(blockIndex: number): Promise<Block> {
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

  getBlockNumber(): Promise<number> {
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

  sendTransaction(transaction: SendTransaction): Promise<EthereumTransaction> {
    return sendWeb3Transaction(this.web3, transaction)
  }

  getGas(): Promise<BigNumber> {
    return new Promise((resolve: Resolve<BigNumber>, reject) => {
      this.web3.eth.getGasPrice((err: any, result: BigNumber) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }
}

export function cloneClient(client: Web3EthereumClient): Web3EthereumClient {
  return new Web3EthereumClient(client.getWeb3())
}