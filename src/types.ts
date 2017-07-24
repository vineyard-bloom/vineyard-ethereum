import BigNumber from 'bignumber.js'

export interface EthereumTransaction {
  to: string
  from: string
  value: any
  gas: number
  hash:number
}

export interface EthereumClient {
  createAddress(): Promise<string>
  getBalance(address: string): Promise<number>
  send(fromAddress: string, toAddress: string, value: string, gas?: string): Promise<EthereumTransaction>
  importAddress(address: string): Promise<void>
  listAllTransactions(address: string, lastblock): Promise<EthereumTransaction[]>
  getAccounts(): Promise<string>
  generate(blockCount: number): Promise<void>
  getGas(): Promise<number>
}

export interface AddressSource {
  generateAddress(): Promise<string>
}

export const gasWei = new BigNumber('21000000000000')
