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

  interactWithContract(abi, address, func, from, ...params) {
    //address = token contract address
    //func = token contract method to call
    this.loadContract(abi)
    .then(contract => {
      return contract.at(address)
      .then(instance => {
        //last param is total tx object
        return instance.func.sendTransaction(...params, {from: from})
      })
    })
  }
}