import * as Web3 from 'web3'
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))

export interface EthereumConfig {
  http: string
}

export interface EthereumClient {
  generateAddress(): Promise<string>
  getBalance(address): Promise<number>
  send(fromAddress: string, toAddress: string, amount: number): Promise<any>
}

export class Web3EthereumClient implements EthereumClient {
  private client

  constructor(ethereumConfig: EthereumConfig) {
    web3.setProvider(new web3.providers.HttpProvider(ethereumConfig.http))
  }

  getClient() {
    return this.client
  }

  toWei(amount: number) {
    return web3.toWei(amount)
  }

  generateAddress(): Promise<string> {

  }

  getBalance(address): Promise<number> {
    return new Promise((resolve, reject) => {
      web3.eth.getBalance(address, (err, result) => {
        if (err)
          resolve(err)
        resolve(result)
      })
    })
  }

  send(fromAddress: string, toAddress: string, amount: number): Promise<any> {
    const transaction = {from: fromAddress, to: toAddress, amount: web3.toWei(amount)}
    return new Promise<any>((resolve, reject) => {
      web3.eth.sendTransaction(transaction, (err, address) => {
        if (err)
          resolve('Error sending to: ' + address)
        resolve(transaction)
      })
    })
  }
}
