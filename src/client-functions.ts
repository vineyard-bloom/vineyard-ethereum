import BigNumber from 'bignumber.js'
import { Block, EthereumTransaction, Web3Transaction, Web3TransactionReceipt } from './types'
import { BaseBlock, blockchain, Resolve } from 'vineyard-blockchain'
import { ContractEvent, EventFilter, getEvents } from './utility'

const Web3 = require('web3')

const SolidityFunction = require('web3/lib/web3/function')
const SolidityEvent = require('web3/lib/web3/event')
const promisify = require('util').promisify
const axios = require('axios')

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
        // console.error('Error processing ethereum block', blockIndex, 'with message', err.message)
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
        // console.error('Error processing ethereum block number', blockNumber, 'with message', err.message)
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
    timeMined: new Date(lastBlock.timestamp * 1000)
  }
}

export function getTransactionReceipt(web3: Web3Client, txid: string): Promise<Web3TransactionReceipt> {
  return new Promise((resolve: Resolve<Web3TransactionReceipt>, reject) => {
    web3.eth.getTransactionReceipt(txid, (err: any, transaction: Web3TransactionReceipt) => {
      if (err) {
        // console.error('Error querying transaction', txid, 'with message', err.message)
        reject(err)
      } else {
        resolve(transaction)
      }
    })
  })
}

export async function getTransactionStatus(web3: Web3Client, txid: string): Promise<blockchain.TransactionStatus> {
  let transactionReceipt: Web3TransactionReceipt = await getTransactionReceipt(web3, txid)
  return transactionReceipt.status.substring(2) === '0' ? blockchain.TransactionStatus.rejected : blockchain.TransactionStatus.accepted
}

export async function getNextBlockInfo(web3: Web3Client, previousBlockIndex: number | undefined): Promise<BaseBlock | undefined> {
  const nextBlockIndex = previousBlockIndex ? previousBlockIndex + 1 : 0
  let nextBlock: Block = await getBlock(web3, nextBlockIndex)
  if (!nextBlock) {
    return undefined
  }
  return {
    hash: nextBlock.hash,
    index: nextBlock.number,
    timeMined: new Date(nextBlock.timestamp * 1000)
  }
}

export function convertStatus(gethStatus: string): blockchain.TransactionStatus {
  switch (gethStatus) {
    case 'pending':
      return blockchain.TransactionStatus.pending

    case 'accepted':
      return blockchain.TransactionStatus.accepted

    case 'rejected':
      return blockchain.TransactionStatus.rejected

    default:
      return blockchain.TransactionStatus.unknown
  }
}

export const toChecksumAddress = Web3.prototype.toChecksumAddress

export function getNullableChecksumAddress(address?: string): string | undefined {
  return typeof address === 'string'
    ? Web3.prototype.toChecksumAddress(address)
    : undefined
}

interface Erc20Grouped {
  attributes: any[],
  balance: any[]
  events: any[],
}

const erc20GroupedAbi = require('./abi/erc20-grouped.json') as Erc20Grouped
const erc20AttributesAbi = erc20GroupedAbi.attributes
const erc20BalanceAbi = erc20GroupedAbi.balance
const erc20TransferEventAbi = erc20GroupedAbi.events.filter(e => e.name == 'Transfer')[0]

const erc20ReadonlyAbi = erc20AttributesAbi.concat(erc20BalanceAbi)

export function checkContractMethod(contract: any, methodName: string, args: any[] = []): Promise<boolean> {
  const method = contract[methodName]
  const payload = method.toPayload(args)
  const defaultBlock = method.extractDefaultBlock(args)

  return new Promise((resolve: Resolve<boolean>, reject) => {
    method._eth.call(payload, defaultBlock, (error: Error, output: string) => {
      if (error) {
        reject(false)
      }
      else {
        resolve(output !== '0x')
      }
    })
  })
}

export async function callContractMethod<T>(contract: any, methodName: string, args: any[] = []): Promise<T> {
  return new Promise((resolve: Resolve<T>, reject) => {
    const handler = (err: any, blockNumber: T) => {
      if (err) {
        reject(err)
      } else {
        resolve(blockNumber)
      }
    }
    const method = contract[methodName]
    method.call.apply(method, args.concat(handler))
  })
}

export async function callCheckedContractMethod<T>(contract: any, methodName: string, args: any[] = []): Promise<T | undefined> {
  const exists = await checkContractMethod(contract, methodName, args)
  if (!exists)
    return undefined

  return callContractMethod<T>(contract, methodName, args)
}

export function createContract(eth: any, abi: any, address: string): any {
  const result: any = {}
  for (let method of abi) {
    result[method.name] = new SolidityFunction(eth, method, address)
  }
  return result
}

export interface DeployContractArguments {
  data: string,
  // abi: any
  from?: string // Not sure this is needed
  gas: number | BigNumber,
  gasPrice: number
}

export async function deployContract(web3: Web3Client, args: DeployContractArguments): Promise<string> {
  const hash = await promisify(web3.eth.sendTransaction.bind(web3.eth))(args)
  return hash
}

export async function getTokenContractFromReceipt(web3: Web3Client, receipt: Web3TransactionReceipt): Promise<blockchain.AnyContract | undefined> {
  const address = receipt.contractAddress
  const contract = createContract(web3.eth, erc20AttributesAbi, address)
  const result: any = {
    contractType: blockchain.ContractType.token,
    address: address,
    txid: receipt.transactionHash
  }
  try {
    for (let method of erc20AttributesAbi) {
      const value = await callCheckedContractMethod<any>(contract, method.name)
      if (value === undefined)
        return {
          contractType: blockchain.ContractType.unknown,
          address: address,
          txid: receipt.transactionHash
        }
      result[method.name] = value
    }

    return result
  } catch (error) {
    return undefined
  }
}

const transferEvent = new SolidityEvent(undefined, erc20TransferEventAbi, '')

export async function getBlockContractTransfers(web3: Web3Client, filter: EventFilter): Promise<blockchain.BaseEvent[]> {
  const events = await getEvents(web3, filter)

  const decoded = events.map(e => transferEvent.decode(e))
  return decoded
  // return decoded.map(d => ({
  //   to: d.args._to,
  //   from: d.args._from,
  //   amount: d.args._value,
  //   txid: d.transactionHash,
  //   contractAddress: d.address,
  //   blockIndex: d.blockNumber
  // }))
}

export function decodeTokenTransfer(event: blockchain.BaseEvent): blockchain.DecodedEvent {
  const result = transferEvent.decode(event)
  result.args = {
    to: toChecksumAddress(result.args._to),
    from: toChecksumAddress(result.args._from),
    value: result.args._value
  }

  return result
}

export function mapTransactionEvents(events: ContractEvent[], txid: string) {
  return events.filter(c => c.transactionHash == txid)
}

export async function loadTransaction(web3: Web3Client, tx: Web3Transaction, block: Block, events: ContractEvent[]) {
  const receipt = await getTransactionReceipt(web3, tx.hash)
  const contract = receipt.contractAddress
    ? await getTokenContractFromReceipt(web3, receipt)
    : undefined

  return {
    txid: tx.hash,
    to: getNullableChecksumAddress(tx.to),
    from: getNullableChecksumAddress(tx.from),
    amount: tx.value,
    timeReceived: new Date(block.timestamp * 1000),
    status: convertStatus(tx.status),
    blockIndex: block.number,
    gasUsed: receipt.gasUsed,
    gasPrice: tx.gasPrice,
    fee: tx.gasPrice.times(receipt.gasUsed),
    newContract: contract,
    events: mapTransactionEvents(events, tx.hash),
    nonce: tx.nonce
  }
}

export async function traceWeb3Transaction(web3: Web3Client, txid: string) {
  const body = {
    jsonrpc: '2.0',
    method: 'debug_traceTransaction',
    params: [txid, {}],
    id: 1
  }
  const response = await axios.post(web3.currentProvider.host, body)
  const callLogs = response.data.result.structLogs.filter(x => x.op === 'CALL')
    .map(x => ({
      gas: parseInt(x.stack[x.stack.length - 1], 10),
      address: '0x' + x.stack[x.stack.length - 2].slice(24),
      value: parseInt(x.stack[x.stack.length - 3], 16),
    })
  )
  return callLogs
}

export function partitionArray<T>(partitionSize: number, items: T[]): T[][] {
  const result: T[][] = []
  for (let i = 0; i < items.length; i += partitionSize) {
    result.push(items.slice(i, i + partitionSize))
  }

  return result
}

export async function partitionedMap<T, O>(partitionSize: number, action: (item: T) => Promise<O>, items: T[]): Promise<O[]> {
  const groups = partitionArray(partitionSize, items)
  let result: O[] = []
  for (let group of groups) {
    const promises = group.map(action)
    const newItems = await Promise.all(promises)
    result = result.concat(newItems)
  }

  return result
}

export async function getFullBlock(web3: Web3Client, blockIndex: number): Promise<blockchain.FullBlock<blockchain.ContractTransaction>> {
  let block = await getBlock(web3, blockIndex)
  const events = await getEvents(web3, {
    toBlock: blockIndex,
    fromBlock: blockIndex,
  })
  for (let event of events) {
    event.address = toChecksumAddress(event.address)
  }
  // console.log('Loaded', events.length, 'events for block', blockIndex)

  const transactions = await partitionedMap(10, tx => loadTransaction(web3, tx, block, events), block.transactions)
  // console.log('Loaded', block.transactions.length, 'transactions for block', blockIndex)

  return {
    index: blockIndex,
    hash: block.hash,
    timeMined: new Date(block.timestamp * 1000),
    transactions: transactions
  }
}