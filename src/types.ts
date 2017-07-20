
export interface EthereumTransaction {
  to: string
  from: string
  wei: string
  gas: string
}

export interface EthereumClient {
  createAddress(): Promise<string>
  getBalance(address: string): Promise<number>
  send(fromAddress: string, toAddress: string, value: string, gas?: string): Promise<EthereumTransaction>
  importAddress(address: string): Promise<void>
  listAllTransactions(address: string, lastblock: number): Promise<any[]>
  getAccounts(): Promise<string>
}

export interface AddressSource {
  generateAddress(): Promise<string>
}
