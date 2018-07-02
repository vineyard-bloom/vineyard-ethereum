import { createNetwork, EthereumNetwork, Keystore } from './ethereum-network'
import { GethNode } from './geth-node'

export class EthereumLab {
  network: EthereumNetwork

  constructor(tempPath: string, startingPort: number, gethPath?: string, keystore?: Keystore) {
    this.network = createNetwork({
      tempPath: tempPath,
      startingPort: startingPort,
      keystore: keystore,
      gethPath: gethPath || 'geth'
    })
  }

  async start (): Promise<void> {
    await this.network.initialize()
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
