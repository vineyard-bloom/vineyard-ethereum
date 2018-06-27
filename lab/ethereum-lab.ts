import { EthereumNetwork } from './ethereum-network'
import { GethNode } from './geth-node'

export class EthereumLab {
  network: EthereumNetwork
  miner: GethNode

  constructor(coinbaseAddress?: string) {
    this.network = new EthereumNetwork({ coinbase: coinbaseAddress })
  }

  async start (): Promise<void> {
    this.network.initialize()
    this.miner = await this.network.createMiner()
  }

  async stop (): Promise<void> {
    this.network.stop()
  }

  send (address: string, amount: number): Promise<void> {
    throw new Error('Not yet implemented')
  }

  reset (): Promise<any> {
    throw new Error('Not yet implemented')
  }
}
