import * as Web3 from 'web3'
import {getTransactionsFromRange, checkAllBalances} from './utility'
import BigNumber from 'bignumber.js';
import {AddressManager, Block, EthereumClient, EthereumTransaction, Web3TransactionReceipt} from "./types";
import {ExternalTransaction, FullBlock, BlockInfo, TransactionStatus} from "vineyard-blockchain";
const util = require("util")


export interface Web3EthereumClientConfig {
  http: string
  sweepAddress?: string
}

export class Web3EthereumClient implements EthereumClient {
  private web3

  constructor(ethereumConfig: Web3EthereumClientConfig) {
    this.web3 = new Web3()
    this.web3.setProvider(new this.web3.providers.HttpProvider(ethereumConfig.http))
  }

  getWeb3() {
    return this.web3
  }

  getNextBlockInfo(previousBlock: BlockInfo): Promise<BlockInfo> {
   const web3GetBlock = util.promisify(this.web3.eth.getBlock)
   return web3GetBlock(previousBlock.index + 1).then((nextBlock: Block) => {
     return {
       hash: nextBlock.hash,
       index: nextBlock.number,
       timeMinded: nextBlock.timestamp
     }
   })
  }

  getFullBlock(block: BlockInfo): Promise<FullBlock> {
    const web3GetBlock = util.promisify(this.web3.eth.getBlock)
    return web3GetBlock(block).then((fullBlock: Block) => {
      return {
        hash: fullBlock.hash,
        index: fullBlock.number,
        timeMined: fullBlock.timestamp,
        transactions: fullBlock.transactions
      }
    })
  }

  getTransactionStatus(txid: string): Promise<TransactionStatus> {
    const web3GetTransactionReceipt = util.promisify(this.web3.eth.getTransactionReceipt)
    return web3GetTransactionReceipt(txid).then((transaction: Web3TransactionReceipt) => {
      return transaction.status.substring(2) == "0" ? TransactionStatus.rejected : TransactionStatus.accepted 
    })
  }

  getTransaction(txid: string) {
    return new Promise((resolve, reject) => {
      this.web3.eth.getTransaction(txid, (err, block) => {
        if (err) {
          console.error('Error querying transaction', txid, 'with message', err.message)
          reject(new Error(err));
        }
        else {
          resolve(block)
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
    return new BigNumber(amount).dividedBy(1000000000000000000).toString();
  }

  createAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      // if (!this.web3.isConnected()) {
      //   reject(new Error("Cannot create address, not connected to client."))
      // }

      this.web3.personal.newAccount((err, result) => {
        if (err)
          reject(new Error("Error creating address: " + err.message))
        else {
          console.log('Created new address', result)
          resolve(result)
        }
      })
    })
  }

  getAccounts(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.web3.eth.getAccounts((err, result) => {
        if (err)
          reject(new Error("Error getting accounts: " + err.message))
        else
          resolve(result)
      })
    })
  }

  getBalance(address: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.web3.eth.getBalance(address, (err, result) => {
        if (err)
          reject(new Error("Error getting balance: " + err.message))
        else
          resolve(result)
      })
    })
  }

  unlockAccount(address: string) {
    return new Promise((resolve, reject) => {
      try {
        this.web3.personal.unlockAccount(address, (err, result) => {
          if (err)
            reject(new Error("Error unlocking account: " + err.message))
          else
            resolve(result)
        })
      }
      catch(error) {
        reject(new Error("Error unlocking account: " + address + '.  ' + error.message))
      }
    })
  }

  send(from: string | object, to?: string, amount?: string): Promise<EthereumTransaction> {
    const transaction = from && typeof from === 'object'
      ? from as any
      : {from: from, to: to, value: amount, gas: 21000}

    if (!transaction.from)
      throw Error("Ethereum transaction.from cannot be empty.")

    if (!transaction.to)
      throw Error("Ethereum transaction.to cannot be empty.")

    if (transaction.from === '')
      transaction.from = this.web3.eth.coinbase

    const original = Object.assign({}, transaction)
    transaction.value = transaction.value.toString()
    transaction.gasPrice = this.web3.toWei(transaction.gasPrice, 'gwei')
    return this.unlockAccount(transaction.from)
      .then(() => {
        // const hexAmount = this.web3.toHex(amount)
        return new Promise<any>((resolve, reject) => {
          this.web3.eth.sendTransaction(transaction, (err, txid) => {
            if (err) {
              console.log('Error sending (original)', original)
              reject('Error sending to ' + to + ": " + err)
            }
            else {
              console.log('Sent Ethereum transaction', txid, this.web3.eth.getTransaction(txid))
              transaction.hash = txid
              resolve(transaction)
            }
          })
        })
      })
  }

  // listAllTransactions(addressManager: AddressManager, lastBlock: number): Promise<EthereumTransaction[]> {
  //   return getTransactionsFromRange(this.web3.eth, lastBlock, addressManager)
  // }

  importAddress(address: string): Promise<void> {
    throw new Error("Not implemented")
  }

  generate(blockCount: number): Promise<void> {
    throw new Error("Not implemented.")
  }

  checkAllBalances(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(checkAllBalances(this.web3))
    })
  }

  getBlock(blockIndex: number): Promise<Block> {
    return new Promise((resolve, reject) => {
      this.web3.eth.getBlock(blockIndex, true, (err, block) => {
        if (err) {
          console.error('Error processing ethereum block', blockIndex, 'with message', err.message)
          reject(new Error(err));
        }
        else {
          resolve(block)
        }
      })
    })
  }

  getBlockNumber(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.web3.eth.getBlockNumber((err, blockNumber) => {
        if (err) {
          console.error('Error processing ethereum block number', blockNumber, 'with message', err.message)
          reject(new Error(err));
        }
        else {
          resolve(blockNumber)
        }
      })
    })
  }

  getGas(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.web3.eth.getGasPrice((err, result) => {
        if (err)
          reject(err)
        else
          resolve(result)
      })
    })
  }
}
