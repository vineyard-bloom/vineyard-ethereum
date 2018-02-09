import { Web3EthereumClient } from '../src'

const contract = require('truffle-contract')
const abii = require('../test/res/abi.json')

export class TokenContract {
  private client: Web3EthereumClient
  private web3: any
  private abi: any
  private contract: any

  constructor(client: Web3EthereumClient, abi?: any) {
    this.client = client
    this.web3 = client.getWeb3()
    // this.abi = abi ? abi : require('../test/res/abi.json') // this is SALT abi for now
    // TODO run truffle compile to build contract abi
    this.abi = abii

    this.contract = contract(this.abi)
    this.contract.setProvider(this.web3.currentProvider || 'https://localhost:8545')
  }

  compileContract(source: any) {
    // deprecated
    return this.web3.eth.compile.solidity(source)
  }

  getContract(abi) {
    return Promise.resolve(this.web3.eth.contract(abi))
  }

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
            return instance.balanceOf.call(from)
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
            return Promise.resolve(instance.transfer.sendTransaction(to, value, {from: from, gas: 4712388}))
              .then(result => {
                console.log(result)
                return result
              }).catch(e => {
                console.error(e)
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
    const myEvent = instance.Transfer({from: from}, {fromBlock: 0, toBlock: 'latest'})
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
        return instance.func.sendTransaction(...params, {from: from})
          .then((result: any) => {
            console.log(result)
          })
      })
  }
}
