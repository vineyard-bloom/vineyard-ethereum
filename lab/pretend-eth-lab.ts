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

  send(amount: number): Promise<EthereumTransaction> {
    return this.client.send('', '', amount)
  }
  getSweepAddress(): string {
    return ""
  }
}