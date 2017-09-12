import {Web3EthereumClient} from "../src"


export class TokenContract {
  private client: Web3EthereumClient
  private web3
  private compiled

  constructor(client: Web3EthereumClient) {
    this.client = client
    this.web3 = client.getWeb3()
  }

  //source might have source.name or something like that

  compileContract(source) {
    return this.compiled = this.web3.eth.compile.solidity(source)
  }

  loadContract(source) {
    return this.web3.eth.contract(this.compiled.source.info.abiDefinition)
  }

  sendToContract(source,func, params, to, from) {
    return this.loadContract(source).func.send(params, {to: to, from: from, data: this.compiled.source.code})
  }
}