import BigNumber from 'bignumber.js';
import { Block, EthereumTransaction, Web3TransactionReceipt } from './types';
import { BaseBlock, blockchain, TransactionStatus } from 'vineyard-blockchain';
export declare type Resolve2<T> = (value: T) => void;
export declare type Web3Client = any;
export interface SendTransaction {
    from: string;
    to: string;
    value: BigNumber;
    gas?: number;
    gasPrice?: BigNumber;
}
export declare function unlockWeb3Account(web3: any, address: string): Promise<boolean>;
export declare function sendWeb3Transaction(web3: any, transaction: SendTransaction): Promise<EthereumTransaction>;
export declare function getBlock(web3: Web3Client, blockIndex: number): Promise<Block>;
export declare function getBlockIndex(web3: Web3Client): Promise<number>;
export declare function getLastBlock(web3: Web3Client): Promise<BaseBlock>;
export declare function getTransactionReceipt(web3: Web3Client, txid: string): Promise<Web3TransactionReceipt>;
export declare function getTransactionStatus(web3: Web3Client, txid: string): Promise<TransactionStatus>;
export declare function getNextBlockInfo(web3: Web3Client, previousBlock: blockchain.Block | undefined): Promise<BaseBlock | undefined>;
export declare function convertStatus(gethStatus: string): TransactionStatus;
export declare function getBlockTransactions(web3: Web3Client, block: blockchain.Block): Promise<blockchain.SingleTransaction[]>;
