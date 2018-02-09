import BigNumber from 'bignumber.js'
import { Block, EthereumTransaction, Web3TransactionReceipt } from './types'
import { BaseBlock, blockchain, Resolve, TransactionStatus } from 'vineyard-blockchain'

export type Resolve2<T> = (value: T) => void

export type Web3Client = any

export interface SendTransaction {
  from: string
  to: string
  value: BigNumber
  gas?: number
  gasPrice?: BigNumber
}

export function unlockWeb3Account(web3: any, address: string) {
  return new Promise((resolve: Resolve<boolean>, reject) => {
    try {
      web3.personal.unlockAccount(address, (err: any, result: boolean) => {
        if (err) {
          reject(new Error('Error unlocking account: ' + err.message))
        } else {
          resolve(result)
        }
      })
    } catch (error) {
      reject(new Error('Error unlocking account: ' + address + '.  ' + error.message))
    }
  })
}

export function sendWeb3Transaction(web3: any, transaction: SendTransaction): Promise<EthereumTransaction> {
  if (!transaction.from) {
    throw Error('Ethereum transaction.from cannot be empty.')
  }

  if (!transaction.to) {
    throw Error('Ethereum transaction.to cannot be empty.')
  }

  return unlockWeb3Account(web3, transaction.from)
    .then(() => {
      return new Promise((resolve: Resolve2<EthereumTransaction>, reject) => {
        web3.eth.sendTransaction(transaction, (err: any, txid: string) => {
          if (err) {
            console.log('Error sending (original)', transaction)
            reject('Error sending to ' + transaction.to + ': ' + err)
          } else {
            const txInfo = web3.eth.getTransaction(txid)
            console.log('Sent Ethereum transaction', txid, txInfo)
            const transactionResult = Object.assign({}, transaction, {
              hash: txid,
              gasPrice: txInfo.gasPrice,
              gas: txInfo.gas
            })
            resolve(transactionResult)
          }
        })
      })
    })
}

export function getBlock(web3: Web3Client, blockIndex: number): Promise<Block> {
  return new Promise((resolve: Resolve<Block>, reject) => {
    web3.eth.getBlock(blockIndex, true, (err: any, block: Block) => {
      if (err) {
        console.error('Error processing ethereum block', blockIndex, 'with message', err.message)
        reject(new Error(err))
      } else {
        resolve(block)
      }
    })
  })
}

export function getBlockIndex(web3: Web3Client): Promise<number> {
  return new Promise((resolve: Resolve<number>, reject) => {
    web3.eth.getBlockNumber((err: any, blockNumber: number) => {
      if (err) {
        console.error('Error processing ethereum block number', blockNumber, 'with message', err.message)
        reject(new Error(err))
      } else {
        resolve(blockNumber)
      }
    })
  })
}

export async function getLastBlock(web3: Web3Client): Promise<BaseBlock> {
  let lastBlock: Block = await getBlock(web3, await getBlockIndex(web3))
  return {
    hash: lastBlock.hash,
    index: lastBlock.number,
    timeMined: new Date(lastBlock.timestamp * 1000),
    currency: 2
  }
}

export function getTransactionReceipt(web3: Web3Client, txid: string): Promise<Web3TransactionReceipt> {
  return new Promise((resolve: Resolve<Web3TransactionReceipt>, reject) => {
    web3.eth.getTransactionReceipt(txid, (err: any, transaction: Web3TransactionReceipt) => {
      if (err) {
        console.error('Error querying transaction', txid, 'with message', err.message)
        reject(err)
      } else {
        resolve(transaction)
      }
    })
  })
}

export async function getTransactionStatus(web3: Web3Client, txid: string): Promise<TransactionStatus> {
  let transactionReceipt: Web3TransactionReceipt = await getTransactionReceipt(web3, txid)
  return transactionReceipt.status.substring(2) === '0' ? TransactionStatus.rejected : TransactionStatus.accepted
}

export async function getNextBlockInfo(web3: Web3Client, previousBlock: blockchain.Block | undefined): Promise<BaseBlock | undefined> {
  const nextBlockIndex = previousBlock ? previousBlock.index + 1 : 0
  let nextBlock: Block = await getBlock(web3, nextBlockIndex)
  if (!nextBlock) {
    return undefined
  }
  return {
    hash: nextBlock.hash,
    index: nextBlock.number,
    timeMined: new Date(nextBlock.timestamp * 1000),
    currency: 2
  }
}

export function convertStatus(gethStatus: string): TransactionStatus {
  switch (gethStatus) {
    case 'pending':
      return TransactionStatus.pending

    case 'accepted':
      return TransactionStatus.accepted

    case 'rejected':
      return TransactionStatus.rejected

    default:
      return TransactionStatus.unknown
  }
}

export async function getBlockTransactions(web3: Web3Client, block: blockchain.Block): Promise<blockchain.SingleTransaction[]> {
  let fullBlock = await getBlock(web3, block.index)
  let blockHeight = await getBlockIndex(web3)
  const transactions = fullBlock.transactions.map(t => ({
    txid: t.hash,
    to: t.to,
    from: t.from,
    amount: t.value,
    timeReceived: new Date(fullBlock.timestamp * 1000),
    confirmations: blockHeight - block.index,
    status: convertStatus(t.status),
    blockIndex: block.index
  }))
  return transactions
}