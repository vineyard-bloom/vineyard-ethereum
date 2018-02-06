import { blockchain } from 'vineyard-blockchain'
import { getBlock, getBlockIndex, getBlockTransactions, Web3Client } from './client-functions'

export class EthereumBlockClient implements blockchain.BlockClient<blockchain.SingleTransaction> {
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

  getBlockTransactions(block: blockchain.Block): Promise<blockchain.SingleTransaction[]> {
    return getBlockTransactions(this.web3, block)
  }

}