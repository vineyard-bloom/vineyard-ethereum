import {Web3EthereumClient} from '../src'
import contract from 'truffle-contract'

export class TokenContract {
  private client: Web3EthereumClient
  private web3

  constructor(client: Web3EthereumClient) {
    this.client = client
    this.web3 = client.getWeb3()
  }

  compileContract(source) {
    return this.web3.eth.compile.solidity(source)
  }

  loadContract(abi) {
    return Promise.resolve(this.web3.eth.contract(abi))
  }

  getTotalSupply(abi, address) {
    return this.loadContract(abi)
    .then(contract => {
      return Promise.resolve(contract.at(address))
      .then(instance => {
        return instance.totalSupply.call()
      })
    })  
  }

  getData(abi, address, from){
    return this.loadContract(abi)
    .then(contract => {
      return Promise.resolve(contract.at(address))
      .then(instance => {
        return instance.balanceOf.getData(from)
      })
    })
  }

  getBalanceOf(abi, address, from) {
    //address = token contract address
    //func = token contract method to call
    return this.loadContract(abi)
    .then(contract => {
      return Promise.resolve(contract.at(address))
      .then(instance => {
        //last param is total tx object
        return instance.balanceOf.call(from)
      })
    })
  }

  transfer(abi, address, from, to, value) {
    return this.loadContract(abi)
    .then(contract => {
      return Promise.resolve(contract.at(address))
        .then(instance => {
          const getData = instance.transfer.getData(to, value)
          return Promise.resolve(this.web3.eth.sendTransaction({to: address, from: from, gas: 2100, gasPrice: 1000000000, data: getData}))
          .then(result => {
            console.log(result)
            return result
          }).catch(e => {
            console.error(e)
          })
        })
    })
  }

  getTransactionReceipt(hash){
    return Promise.resolve(this.web3.eth.getTransactionReceipt(hash))
      .then(result => {
        return result
      })
      .catch(e => {
        console.error(e)
      })
  }

  watchContract(instance, from){
    const myEvent = instance.Transfer({from: from}, {fromBlock: 0, toBlock: 'latest'});
    myEvent.watch(function(error, result){
       console.log('watch results: ', result)
    })

  // const myResults = myEvent.get(function(error, logs){})
  }

  //TODO deploy contract with truffle from in here for easy onboarding

  //different approach with truffle-contract directly - not working
  setupContract(abi, address, func, from, ...params) {
    let newContract = contract(abi)
    newContract.setProvider(this.client)
    newContract.deployed()
      .then(instance => {
        //last param is total tx object
        return instance.func.sendTransaction(...params, {from: from})
        .then(result => {
          console.log(result)
        })
      })
  }
}