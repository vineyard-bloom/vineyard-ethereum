import {EthLab} from "./eth-lab";
import {EthereumTransaction, MockEthereumClient} from "../src";

export class PretendEthLab implements EthLab {
  client: MockEthereumClient

  constructor(client: MockEthereumClient) {
    this.client = client
    client.importAddress('')
  }
  start(): Promise<void
> {
    return Promise.resolve()
  }

  stop(): Promise<any> {
    return Promise.resolve()
  }

  reset(): Promise<any> {
    // return this.deleteWallet()
    return this.start()
    // .then(() => this.deleteWallet())
    // .then(() => this.start())
  }

  send(address: string, amount): Promise<EthereumTransaction> {
    return this.client.send('', address, amount)
  }

  getSweepAddress(): string {
    return ""
  }

  generate(blockCount: number): Promise<any> {
    return this.client.generate(blockCount)
  }
}