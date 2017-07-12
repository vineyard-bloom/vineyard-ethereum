import {EthLab} from "./eth-lab";
import {MockEthereumClient} from "../src/ethereum-client";

export class PretendEthLab implements EthLab {
  client: MockEthereumClient

  constructor(client: MockEthereumClient) {
    this.client = client
    client.importAddress('')
  }

  start(): Promise<void> {
    return null
  }

  generate(amount: number): Promise<void> {
    return this.client.generate('', amount)
  }

  getSweepAddress(): string {
    return ""
  }
}