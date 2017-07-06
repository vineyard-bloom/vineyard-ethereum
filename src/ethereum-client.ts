import * as Web3 from 'web3'
const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))

export interface EthereumTransaction {

}

export interface EthereumConfig {
  http: string
}

export interface EthereumClient {
  generateAddress(): Promise<string>
  getBalance(address: string): Promise<number>
  send(fromAddress: string, toAddress: string, amount: number): Promise<EthereumTransaction>
}

export interface AddressSource {
  generateAddress(): Promise<string>
}

export class PredefinedAddressSource implements AddressSource {
  private addresses: string[]
  private index: number = 0

  constructor(addresses: string[]) {
    this.addresses = addresses
  }

  generateAddress(): Promise<string> {
    return Promise.resolve(this.addresses[this.index++])
  }
}

export class MockEthereumClient implements EthereumClient {
  private addressSource: AddressSource
  private addresses: { key: string; value: number }

  constructor(addressSource: AddressSource) {
    this.addressSource = addressSource
  }

  generateAddress(): Promise<string> {
    return this.addressSource.generateAddress()
      .then(address => {
        this.addresses[address] = 0
        return Promise.resolve(address);
      })
  }

  generatePoolAddress(): Promise<string> {
    return this.addressSource.generateAddress()
      .then(address => {
        this.addresses[address] = 0
        return Promise.resolve(address);
      })
  }

  getBalance(address: string): Promise<number> {
    return Promise.resolve(this.addresses[address])
  }

  send(fromAddress: string, toAddress: string, amount: number): Promise<EthereumTransaction> {
    if (this.addresses[fromAddress] < amount)
      throw new Error('not enough funds')

    this.addresses[fromAddress] -= amount
    this.addresses[toAddress] += amount

    return Promise.resolve({})
  }
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

  fromWei(amount:number) {
    return amount * 1000000000000000000
  }

  generateAddress(): Promise<string> {
    return Promise.resolve(web3.personal.newAccount())
  }

  getAccounts(): Promise<string> {
    return Promise.resolve(web3.eth.accounts)
  }

  getBalance(address: string): Promise<number> {
    return new Promise((resolve, reject) => {
      web3.eth.getBalance(address, (err, result) => {
        if (err)
          resolve(err)
        resolve(result)
      })
    })
  }

  send(fromAddress: string, toAddress: string, amount: number): Promise<EthereumTransaction> {
    web3.personal.unlockAccount(fromAddress)
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




// web3.personal.sendTransaction({from: web3.personal.defaultAccount, to: web3.eth.accounts[1], amount: 100}, function(tx){console.log(tx)})