import { blockchain } from 'vineyard-blockchain'
import { getBlock, getBlockIndex, getFullBlock, Web3Client } from './client-functions'
import { initializeWeb3 } from './utility'
import { Web3EthereumClientConfig } from './ethereum-client'

export class EthereumBlockClient implements blockchain.BlockReader<blockchain.ContractTransaction> {
  private web3: Web3Client

  constructor(web3: Web3Client) {
    this.web3 = web3
  }

  getBlockIndex(): Promise<number> {
    return getBlockIndex(this.web3)
  }

  async getBlockInfo(index: number): Promise<blockchain.Block | undefined> {
    const block = await getBlock(this.web3, index)
    return block
      ? {
        index: block.number,
        hash: block.hash,
        timeMined: new Date(block.timestamp * 1000)
      }
      : undefined
  }

  getFullBlock(blockIndex: number): Promise<blockchain.FullBlock<blockchain.ContractTransaction> | undefined> {
    return getFullBlock(this.web3, blockIndex)
  }

  async getBlockTransactions(blockIndex: number): Promise<blockchain.ContractTransaction[]> {
    const block = await getFullBlock(this.web3, blockIndex)
    return block
      ? block.transactions
      : []
  }

  static createFromConfig(config: Web3EthereumClientConfig) {
    return new EthereumBlockClient(initializeWeb3(config))
  }
}