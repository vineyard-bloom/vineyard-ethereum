import {Web3EthereumClient} from "../src"
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
    this.loadContract(abi)
    .then(contract => {
      return contract.at(address)
      .then(instance => {
        return instance.func.sendTransaction(...params, {from: from})
      })
    })
  }
}