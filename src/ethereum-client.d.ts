import BigNumber from 'bignumber.js';
import { Block, EthereumTransaction, EthereumTransactionOld, Web3TransactionReceipt } from './types';
import { BaseBlock, BlockInfo, ExternalSingleTransaction as ExternalTransaction, FullBlock, ReadClient, TransactionStatus } from 'vineyard-blockchain';
import { SendTransaction, Web3Client } from './client-functions';
export interface Web3EthereumClientConfig {
    http: string;
    sweepAddress?: string;
}
export declare class Web3EthereumClient implements ReadClient<ExternalTransaction> {
    private web3;
    constructor(config: Web3EthereumClientConfig, web3?: Web3Client);
    getWeb3(): any;
    getBlockIndex(): Promise<number>;
    getLastBlock(): Promise<BaseBlock>;
    getNextBlockInfo(previousBlock: BlockInfo | undefined): Promise<BaseBlock | undefined>;
    getFullBlock(block: BlockInfo): Promise<FullBlock<ExternalTransaction>>;
    getTransactionStatus(txid: string): Promise<TransactionStatus>;
    unlockAccount(address: string): Promise<boolean>;
    send(from: string | object, to?: string, amount?: string): Promise<EthereumTransactionOld>;
    getTransactionReceipt(txid: string): Promise<Web3TransactionReceipt>;
    getTransaction(txid: string): Promise<ExternalTransaction>;
    getCoinbase(): Promise<any>;
    toWei(amount: number): any;
    fromWei(amount: number): string;
    createAddress(): Promise<string>;
    getAccounts(): Promise<string[]>;
    getBalance(address: string): Promise<string>;
    importAddress(address: string): Promise<void>;
    generate(blockCount: number): Promise<void>;
    checkAllBalances(): Promise<any>;
    getBlock(blockIndex: number): Promise<Block>;
    getBlockNumber(): Promise<number>;
    sendTransaction(transaction: SendTransaction): Promise<EthereumTransaction>;
    getGas(): Promise<BigNumber>;
}
export declare function cloneClient(client: Web3EthereumClient): Web3EthereumClient;
