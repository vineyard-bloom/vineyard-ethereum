import * as Web3 from 'web3';
import { EthereumClient } from "./types";
import { ExternalTransaction, FullBlock, BlockInfo, TransactionStatus } from "vineyard-blockchain";
export interface Web3EthereumClientConfig {
    http: string;
    sweepAddress?: string;
}
export declare class Web3EthereumClient implements EthereumClient {
    private web3;
    constructor(ethereumConfig: Web3EthereumClientConfig, web3?: Web3);
    getWeb3(): any;
    getNextBlockInfo(previousBlock: BlockInfo): Promise<BlockInfo>;
    getFullBlock(block: BlockInfo): Promise<FullBlock>;
    getTransactionStatus(txid: string): Promise<TransactionStatus>;
    getTransaction(txid: string): Promise<ExternalTransaction>;
    getCoinbase(): Promise<any>;
    toWei(amount: number): any;
    fromWei(amount: number): string;
    createAddress(): Promise<string>;
    getAccounts(): Promise<string[]>;
    getBalance(address: string): Promise<any>;
    unlockAccount(address: string): Promise<{}>;
    c: {
        const: any;
        if(): any;
    };
    transaction: any;
}
