import { Web3EthereumClient } from '../src'

const contract = require('truffle-contract')
// this is SALT smart contract - artifact of running truffle-compile
const saltCompiledContract = {} // require('../test/res/compiled-salt-contract.json')

export class TokenContract {
  private client: Web3EthereumClient
  private web3: any
  private abi: any
  private contract: any
  private rawCompiledContract: any

  constructor(client: Web3EthereumClient, abi?: any) {
    this.client = client
    this.web3 = client.getWeb3()
    // TODO run truffle compile to build contract abi
    this.rawCompiledContract = saltCompiledContract
    this.abi = abi ? abi : this.rawCompiledContract.abi
    // this is for deploying a contract locally in test environment
    this.contract = contract(this.rawCompiledContract)
    this.contract.setProvider(this.web3.currentProvider || 'https://localhost:8545')
  }

  compileContract(source: any) {
    // deprecated
    return this.web3.eth.compile.solidity(source)
  }

  getContract(abi: any) {
    return Promise.resolve(this.web3.eth.contract(abi))
  }

  // this is for unit testing
  async loadContract(address: string) {
    await this.client.unlockAccount(address)
    try {
      const instance = await this.contract.new({ from: address, gas: 4712388 })
      return instance
    } catch (err) {
      console.error('Error loading contract: ', err)
    }
  }

  getTotalSupply(abi: any, address: string) {
    return this.getContract(abi)
      .then(contract => {
        return Promise.resolve(contract.at(address))
          .then(instance => {
            return instance.totalSupply.call()
          })
      })
  }

  getData(abi: any, address: string, from: string) {
    return this.getContract(abi)
      .then(contract => {
        return Promise.resolve(contract.at(address))
          .then(instance => {
            return instance.balanceOf.getData(from)
          })
      })
  }

  getBalanceOf(abi: any, address: string, from: string) {
    // address = token contract address
    // func = token contract method to call
    return this.getContract(abi)
      .then(contract => {
        return Promise.resolve(contract.at(address))
          .then(instance => {
            // last param is total tx object
            return Promise.resolve(instance.balanceOf.call(from)) // balanceOf is contract specific, make dynamic
          })
          .catch(e => {
            console.error('Error getting balance of: ', e.message)
          })
      })
  }

  transfer(abi: any, address: string, from: string, to: string, value: any) {
    // address = token contract address
    return this.getContract(abi)
      .then(contract => {
        return Promise.resolve(contract.at(address))
          .then(instance => {
            // this.watchContract(instance, from)
            return Promise.resolve(instance.transfer.sendTransaction(to, value, { from: from, gas: 4712388 }))
              .then(result => {
                console.log('Token transfer success:', result)
                return result
              }).catch(e => {
                console.error('Token transfer error: ', e.message)
              })
          })
      })
  }

  getTransactionReceipt(hash: string) {
    return Promise.resolve(this.web3.eth.getTransactionReceipt(hash))
      .then(result => {
        return result
      })
      .catch(e => {
        console.error(e)
      })
  }

  watchContract(instance: any, from: string) {
    const myEvent = instance.Transfer({ from: from }, { fromBlock: 0, toBlock: 'latest' })
    myEvent.watch(function (error: Error, result: any) {
      console.log('watch results: ', result)
    })

    // const myResults = myEvent.get(function(error, logs){})
  }

  // TODO deploy contract with truffle from in here for easy onboarding

  // different approach with truffle-contract directly - not working
  setupContract(abi: any, address: string, func: any, from: string, ...params: any[]) {
    let newContract = contract(abi)
    newContract.setProvider(this.client)
    newContract.deployed()
      .then((instance: any) => {
        // last param is total tx object
        return instance.func.sendTransaction(...params, { from: from })
          .then((result: any) => {
            console.log(result)
          })
      })
  }
}
