import {EthLab} from "./eth-lab";
import {MockEthereumClient} from "../src/ethereum-client";
import {EthereumTransaction} from "../src";

export class PretendEthLab implements EthLab {
  client: MockEthereumClient

  constructor(client: MockEthereumClient) {
    this.client = client
    client.importAddress('')
  }

 start(): Promise<void> {
    return null
  }

  stop(): Promise<any> {
    return null
  }

  reset(): Promise<any> {
    // return this.deleteWallet()
    return this.start()
    // .then(() => this.deleteWallet())
    // .then(() => this.start())
  }

  send(amount: number): Promise<EthereumTransaction> {
    return this.client.send('', '', amount)
  }
  getSweepAddress(): string {
    return ""
  }
}