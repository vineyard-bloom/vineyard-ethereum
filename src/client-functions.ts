import BigNumber from 'bignumber.js'
import { Block, EthereumTransaction, Web3Transaction, Web3TransactionReceipt } from './types'
import { BaseBlock, blockchain, Resolve } from 'vineyard-blockchain'
import { ContractEvent, EventFilter, getEvents } from './utility'
import { Block } from 'bitcoinjs-lib';

const Web3 = require('web3')
const SolidityCoder = require('web3/lib/solidity/coder')
const SolidityFunction = require('web3/lib/web3/function')
const SolidityEvent = require('web3/lib/web3/event')
const promisify = require('util').promisify
const axios = require('axios')
const ethereumBlocks = require('ethereumjs-block')

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

export function getTransaction(web3: Web3Client, txid: string): Promise<any> {
  return new Promise((resolve: Resolve<any>, reject) => {
    web3.eth.getTransaction(txid, (err: any, transaction: any) => {
      if (err) {
        console.error('Error querying transaction', txid, 'with message', err.message)
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
  const nextBlockIndex = !!(previousBlockIndex + 1) > 0 ? previousBlockIndex + 1 : 0
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
  if (!receipt)
    throw new Error('Could not find receipt for transaction ' + tx.hash)

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

export interface VmOperation {
  op: string
  stack: string[]
}

export interface VmTrace {
  structLogs: VmOperation[]
}

export interface InternalTransfer {
  gas: BigNumber,
  address: string,
  value: BigNumber
}

export async function traceTransaction(web3: Web3Client, txid: string): Promise<VmTrace> {
  const body = {
    jsonrpc: '2.0',
    method: 'debug_traceTransaction',
    params: [txid, {}],
    id: 1
  }
  const response = await axios.post(web3.currentProvider.host, body)
  return response.data.result
}

export async function getInternalTransactions(web3: Web3Client, txid: string): Promise<InternalTransfer[]> {
  const result = await traceTransaction(web3, txid)
  const calls = result.structLogs.filter(x => x.op === 'CALL')
  return calls.map(call => {
    const { stack } = call
    const offset = stack.length - 3
    return {
      gas: new BigNumber('0x' + stack[offset]),
      address: '0x' + stack[offset + 1].slice(24),
      value: new BigNumber('0x' + stack[offset + 2]),
    }
  })
}

export async function traceWeb3Transaction(web3: Web3Client, txid: string) {
  const result = await traceTransaction(web3, txid)
  const callLogs = result.structLogs.filter((x: any) => x.op === 'CALL')
    .map((x: any) => ({
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
    parentHash: block.parentHash,
    uncleHash: block.sha3Uncles,
    coinbase: block.miner,
    stateRoot: block.stateRoot,
    transactionsTrie: block.transactionsRoot,
    receiptTrie: block.receiptRoot || block.receiptsRoot,
    bloom: block.logsBloom,
    difficulty: block.difficulty.toString(),
    number: block.number,
    gasLimit: block.gasLimit,
    gasUsed: block.gasUsed,
    timestamp: block.timestamp,
    extraData: block.extraData,
    mixHash: block.mixHash,
    nonce: block.nonce,
    timeMined: new Date(block.timestamp * 1000),
    transactions: transactions
  }
}

export async function getFullTokenBlock(web3: Web3Client, blockIndex: number, tokenContractAddress: string, methodIDs: any[]): Promise<blockchain.FullBlock<blockchain.ContractTransaction>> {
  let fullBlock = await getBlock(web3, blockIndex)
  let blockHeight = await getBlockIndex(web3)
  const filteredTransactions = filterTokenTransaction(web3, fullBlock.transactions, tokenContractAddress)
  const decodedTransactions = await decodeTransactions(web3, filteredTransactions, methodIDs)
  const transactions = decodedTransactions.map(t => ({
    txid: t.hash,
    to: t.to,
    from: t.from,
    amount: t.value,
    timeReceived: new Date(fullBlock.timestamp * 1000),
    confirmations: blockHeight - blockIndex,
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

export function filterTokenTransaction(web3: Web3Client, transactions: Web3Transaction[], tokenContractAddress: string) {
  return transactions.filter(tx => {
    if (tx && tx.to) {
      return tx.to.toLowerCase() === tokenContractAddress.toLowerCase()
    }
  })
}

export async function decodeTransactions(web3: Web3Client, transactions: any[], methodIDs: any[]) {
  let decodedTransactions = []
  for (let t of transactions) {
    const transaction = await web3.eth.getTransactionReceipt(t.hash)
    if (transaction && transaction.blockNumber && transaction.status === '0x1') {
      let decoded = decodeTransaction(t, methodIDs)
      t.to = decoded.to
      t.value = decoded.value
      decodedTransactions.push(t)
    }
  }
  return decodedTransactions
}

export function decodeTransaction(transaction: any, methodIDs: any[]) {
  let transferTo
  let transferValue
  const decodedData = decodeMethod(transaction.input, methodIDs)
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

export function decodeMethod(data: any, methodIDs: any[]) {
  const methodID = data.slice(2, 10)
  const abiItem = methodIDs[methodID]
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

export async function isContractAddress(web3: Web3Client, address: string): Promise<boolean> {
  const code = await web3.eth.getCode(address)
  if (code === '0x') {
    return false
  }
  return true
}
import BigNumber from 'bignumber.js'
import { Block, EthereumTransaction, Web3Transaction, Web3TransactionReceipt } from './types'
import { BaseBlock, blockchain, Resolve } from 'vineyard-blockchain'
import { ContractEvent, EventFilter, getEvents } from './utility'
import { Block } from 'bitcoinjs-lib';

const Web3 = require('web3')
const SolidityCoder = require('web3/lib/solidity/coder')
const SolidityFunction = require('web3/lib/web3/function')
const SolidityEvent = require('web3/lib/web3/event')
const promisify = require('util').promisify
const axios = require('axios')
const ethereumBlocks = require('ethereumjs-block')

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

export function getTransaction(web3: Web3Client, txid: string): Promise<any> {
  return new Promise((resolve: Resolve<any>, reject) => {
    web3.eth.getTransaction(txid, (err: any, transaction: any) => {
      if (err) {
        console.error('Error querying transaction', txid, 'with message', err.message)
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
  const nextBlockIndex = !!(previousBlockIndex + 1) > 0 ? previousBlockIndex + 1 : 0
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
  if (!receipt)
    throw new Error('Could not find receipt for transaction ' + tx.hash)

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

export interface VmOperation {
  op: string
  stack: string[]
}

export interface VmTrace {
  structLogs: VmOperation[]
}

export interface InternalTransfer {
  gas: BigNumber,
  address: string,
  value: BigNumber
}

export async function traceTransaction(web3: Web3Client, txid: string): Promise<VmTrace> {
  const body = {
    jsonrpc: '2.0',
    method: 'debug_traceTransaction',
    params: [txid, {}],
    id: 1
  }
  const response = await axios.post(web3.currentProvider.host, body)
  return response.data.result
}

export async function getInternalTransactions(web3: Web3Client, txid: string): Promise<InternalTransfer[]> {
  const result = await traceTransaction(web3, txid)
  const calls = result.structLogs.filter(x => x.op === 'CALL')
  return calls.map(call => {
    const { stack } = call
    const offset = stack.length - 3
    return {
      gas: new BigNumber('0x' + stack[offset]),
      address: '0x' + stack[offset + 1].slice(24),
      value: new BigNumber('0x' + stack[offset + 2]),
    }
  })
}

export async function traceWeb3Transaction(web3: Web3Client, txid: string) {
  const result = await traceTransaction(web3, txid)
  const callLogs = result.structLogs.filter((x: any) => x.op === 'CALL')
    .map((x: any) => ({
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

export async function getFullTokenBlock(web3: Web3Client, blockIndex: number, tokenContractAddress: string, methodIDs: any[]): Promise<blockchain.FullBlock<blockchain.ContractTransaction>> {
  let fullBlock = await getBlock(web3, blockIndex)
  let blockHeight = await getBlockIndex(web3)
  const filteredTransactions = filterTokenTransaction(web3, fullBlock.transactions, tokenContractAddress)
  const decodedTransactions = await decodeTransactions(web3, filteredTransactions, methodIDs)
  const transactions = decodedTransactions.map(t => ({
    txid: t.hash,
    to: t.to,
    from: t.from,
    amount: t.value,
    timeReceived: new Date(fullBlock.timestamp * 1000),
    confirmations: blockHeight - blockIndex,
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

export function filterTokenTransaction(web3: Web3Client, transactions: Web3Transaction[], tokenContractAddress: string) {
  return transactions.filter(tx => {
    if (tx && tx.to) {
      return tx.to.toLowerCase() === tokenContractAddress.toLowerCase()
    }
  })
}

export async function decodeTransactions(web3: Web3Client, transactions: any[], methodIDs: any[]) {
  let decodedTransactions = []
  for (let t of transactions) {
    const transaction = await web3.eth.getTransactionReceipt(t.hash)
    if (transaction && transaction.blockNumber && transaction.status === '0x1') {
      let decoded = decodeTransaction(t, methodIDs)
      t.to = decoded.to
      t.value = decoded.value
      decodedTransactions.push(t)
    }
  }
  return decodedTransactions
}

export function decodeTransaction(transaction: any, methodIDs: any[]) {
  let transferTo
  let transferValue
  const decodedData = decodeMethod(transaction.input, methodIDs)
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

export function decodeMethod(data: any, methodIDs: any[]) {
  const methodID = data.slice(2, 10)
  const abiItem = methodIDs[methodID]
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

export async function isContractAddress(web3: Web3Client, address: string): Promise<boolean> {
  const code = await web3.eth.getCode(address)
  if (code === '0x') {
    return false
  }
  return true
}


function hashBlock(blockParams:any) {
  const web3Header = new ethereumBlocks.Header({
    parentHash: blockParams.parentHash,
    uncleHash: blockParams.sha3Uncles,
    coinbase: blockParams.miner,
    stateRoot: blockParams.stateRoot,
    transactionsTrie: blockParams.transactionsRoot,
    receiptTrie: blockParams.receiptRoot || blockParams.receiptsRoot,
    bloom: blockParams.logsBloom,
    difficulty: blockParams.difficulty.toString(),
    number: blockParams.number,
    gasLimit: blockParams.gasLimit,
    gasUsed: blockParams.gasUsed,
    timestamp: blockParams.timestamp,
    extraData: blockParams.extraData,
    mixHash: blockParams.mixHash,
    nonce: blockParams.nonce
  })

  return web3Header.hash().toString('hex')
}

export async function getParentBlockHash(model:any,parentBlock:any): Promise<string> {
    // doing this _COULD_ result in the block being null if it does not exist
    const parentBlockHash = await model.Block.filter({'number': parentBlock}).first();
    if ( parentBlockHash == null ) {
        let err = 'Parent Block is Null at block: ' + (parentBlock).toString()
        throw new Error( err )
    }
    return Promise.resolve(parentBlockHash)
}

export async function validateBlock(model:any, blockNumber: number): Promise<any>{
  let validationInfo;
  try {
    const block = await model.Block.filter({'number': blockNumber}).first();
    const parentBlockHash:string = await getParentBlockHash(model,blockNumber - 1) // needs updating
    const currentBlockHash:string = hashBlock(block)
    if( currentBlockHash == parentBlockHash ) {
      validationInfo = {
        'isValid': true,
        'error': null,
        'currentBlockHash': currentBlockHash,
        'currentBlock': blockNumber,
        'parentBlockHash': parentBlockHash,
        'parentBlock': blockNumber - 1
      }      
    } else {
      validationInfo = {
        'isValid': false,
        'error': 'Block hashes do not match at block ' + blockNumber.toString(),
        'currentBlockHash': currentBlockHash,
        'currentBlock': blockNumber,
        'parentBlockHash': parentBlockHash,
        'parentBlock': blockNumber - 1
      }
    }
    return validationInfo
  } catch (error) {
    validationInfo = {
      'isValid': false,
      'error': error,
      'currentBlockHash': '',
      'currentBlock': blockNumber,
      'parentBlockHash': '',
      'parentBlock': blockNumber - 1
    }
    return validationInfo
  }
}
