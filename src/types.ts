import BigNumber from 'bignumber.js'
import Bristle from './sweep.js'

export interface EthereumTransaction {
  to: string
  from: string
  value: any
  gas: number
  hash: number
}

export interface Block {
  transactions: EthereumTransaction[]
}

export interface AddressManager {
  hasAddress(address: string): Promise<boolean>
}

export interface EthereumClient {
  checkAllBalances(): Promise<any>
  createAddress(): Promise<string>
  getBalance(address: string): Promise<number>
  send(fromAddress: string, toAddress: string, value: string, gas?: string): Promise<EthereumTransaction>
  importAddress(address: string): Promise<void>
  getAccounts(): Promise<string>
  generate(blockCount: number): Promise<void>
  getBlock(blockIndex: number): Promise<Block>
  getBlockNumber(): Promise<number>
  getTransaction(txid): Promise<any>
  getGas(): Promise<number>
}

export interface AddressSource {
  generateAddress(): Promise<string>
}

export const gasWei = new BigNumber('21000000000000')

export interface GenericEthereumManager<EthereumTransaction> extends AddressManager {
  saveTransaction(transaction: EthereumTransaction, blockIndex:number)
  getLastBlock(): Promise<number>
  setLastBlock(lastblock: number): Promise<void>
  getResolvedTransactions(confirmedBlockNumber: number): Promise<EthereumTransaction[]>
  onConfirm(transaction: EthereumTransaction): Promise<EthereumTransaction>
  onDenial(transaction: EthereumTransaction): Promise<EthereumTransaction>
  setStatus(transaction: EthereumTransaction, value): Promise<EthereumTransaction>
  saveSweepRecord(bristle: Bristle):Promise<any>
}
