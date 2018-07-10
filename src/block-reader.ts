import { blockchain } from 'vineyard-blockchain'
import { getBlock, getBlockContractTransfers, getBlockIndex, getFullBlock, Web3Client } from './client-functions'
import { initializeWeb3 } from './utility'
import { Web3EthereumClientConfig } from './ethereum-client'

export class EthereumBlockReader implements blockchain.BlockReader<blockchain.EthereumBlock, blockchain.ContractTransaction>
{
  protected web3: Web3Client

  constructor(web3: Web3Client) {
    this.web3 = web3
  }

  getHeighestBlockIndex(): Promise<number> {
    return getBlockIndex(this.web3)
  }

  getBlockBundle(blockIndex: number): Promise<blockchain.BlockBundle<blockchain.EthereumBlock, blockchain.ContractTransaction>> {
    return getFullBlock(this.web3, blockIndex)
  }

  async getBlockTransactions(blockIndex: number): Promise<blockchain.ContractTransaction[]> {
    const block = await getFullBlock(this.web3, blockIndex)
    return block
      ? block.transactions
      : []
  }

  static createFromConfig(config: Web3EthereumClientConfig) {
    return new EthereumBlockReader(initializeWeb3(config))
  }
}