import BigNumber from 'bignumber.js';
import { Block, EthereumClient, EthereumTransaction } from "./types";
import { SingleTransaction as Transaction, ExternalSingleTransaction as ExternalTransaction, FullBlock, BlockInfo, BaseBlock, TransactionStatus } from "vineyard-blockchain";
export interface Web3EthereumClientConfig {
    http: string;
    sweepAddress?: string;
}
export declare class Web3EthereumClient implements EthereumClient {
    private web3;
    constructor(ethereumConfig: Web3EthereumClientConfig, web3?: Web3Client);
    getWeb3(): any;
    getLastBlock(): Promise<BaseBlock>;
    getNextBlockInfo(previousBlock: BlockInfo | undefined): Promise<BaseBlock>;
    getFullBlock(block: BlockInfo): Promise<FullBlock<Transaction>>;
    getTransactionStatus(txid: string): Promise<TransactionStatus>;
    getTransaction(txid: string): Promise<ExternalTransaction>;
    getCoinbase(): Promise<any>;
    toWei(amount: number): any;
    fromWei(amount: number): string;
    createAddress(): Promise<string>;
    getAccounts(): Promise<string[]>;
    getBalance(address: string): Promise<string>;
    unlockAccount(address: string): Promise<boolean>;
    send(from: string | object, to?: string, amount?: string): Promise<EthereumTransaction>;
    importAddress(address: string): Promise<void>;
    generate(blockCount: number): Promise<void>;
    checkAllBalances(): Promise<any>;
    getBlock(blockIndex: number): Promise<Block>;
    getBlockNumber(): Promise<number>;
    getGas(): Promise<BigNumber>;
}
export declare type Web3Client = any;
