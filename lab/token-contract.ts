import {Web3EthereumClient} from "../src"


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
    return this.web3.eth.contract(abi)
  }

  interactWithContract(abi, address, func, params, from) {
    let instance = this.loadContract(abi).at(address)
    return instance.func.sendTransaction(params, {from: from})
  }
}