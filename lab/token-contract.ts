import {Web3EthereumClient} from '../src'
const contract = require('truffle-contract')

export class TokenContract {
  private client: Web3EthereumClient
  private web3: any

  constructor (client: Web3EthereumClient) {
    this.client = client
    this.web3 = client.getWeb3()
  }

  compileContract (source: any) {
    return this.web3.eth.compile.solidity(source)
  }

  loadContract (abi: any) {
    return Promise.resolve(this.web3.eth.contract(abi))
  }

  getTotalSupply (abi: any, address: string) {
    return this.loadContract(abi)
      .then(contract => {
        return Promise.resolve(contract.at(address))
          .then(instance => {
            return instance.totalSupply.call()
          })
      })
  }

  getData (abi: any, address: string, from: string) {
    return this.loadContract(abi)
      .then(contract => {
        return Promise.resolve(contract.at(address))
          .then(instance => {
            return instance.balanceOf.getData(from)
          })
      })
  }

  getBalanceOf (abi: any, address: string, from: string) {
    // address = token contract address
    // func = token contract method to call
    return this.loadContract(abi)
      .then(contract => {
        return Promise.resolve(contract.at(address))
          .then(instance => {
            // last param is total tx object
            return instance.balanceOf.call(from)
          })
      })
  }

  transfer (abi: any, address: string, from: string, to: string, value: any) {
    // address = token contract address
    return this.loadContract(abi)
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

  getTransactionReceipt (hash: string) {
    return Promise.resolve(this.web3.eth.getTransactionReceipt(hash))
      .then(result => {
        return result
      })
      .catch(e => {
        console.error(e)
      })
  }

  watchContract (instance: any, from: string) {
    const myEvent = instance.Transfer({from: from}, {fromBlock: 0, toBlock: 'latest'})
    myEvent.watch(function (error: Error, result: any) {
      console.log('watch results: ', result)
    })

    // const myResults = myEvent.get(function(error, logs){})
  }

  // TODO deploy contract with truffle from in here for easy onboarding

  // different approach with truffle-contract directly - not working
  setupContract (abi: any, address: string, func: any, from: string, ...params: any[]) {
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
