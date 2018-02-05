import { blockchain } from 'vineyard-blockchain'
import {
  getBlockIndex, getBlockTransactions, getLastBlock, getNextBlockInfo,
  getTransactionStatus, Web3Client
} from './client-functions'

export class EthereumReadClient implements blockchain.ReadClient<blockchain.SingleTransaction> {
  private web3: Web3Client

  constructor(web3: Web3Client) {
    this.web3 = web3
  }

  getBlockIndex(): Promise<number> {
    return getBlockIndex(this.web3)
  }

  getLastBlock(): Promise<blockchain.Block> {
    return getLastBlock(this.web3)
  }

  getTransactionStatus(txid: string): Promise<blockchain.TransactionStatus> {
    return getTransactionStatus(this.web3, txid)
  }

  getNextBlockInfo(block: blockchain.Block | undefined): Promise<blockchain.Block | undefined> {
    return getNextBlockInfo(this.web3, block)
  }

  getBlockTransactions(block: blockchain.Block): Promise<blockchain.SingleTransaction[]> {
    return getBlockTransactions(this.web3, block)
  }

}