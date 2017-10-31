import { Block, EthereumClient, EthereumTransaction } from "./types";
import { FullBlock, BlockInfo } from "vineyard-blockchain";
export interface Web3EthereumClientConfig {
    http: string;
    sweepAddress?: string;
}
export declare class Web3EthereumClient implements EthereumClient {
    private web3;
    constructor(ethereumConfig: Web3EthereumClientConfig);
    getWeb3(): any;
    getNextBlockInfo(previousBlock: BlockInfo): Promise<BlockInfo>;
    getFullBlock(block: BlockInfo): Promise<FullBlock>;
    getTransactionStatus(txid: string): Promise<number>;
    getTransaction(txid: string): Promise<{}>;
    getCoinbase(): Promise<any>;
    toWei(amount: number): any;
    fromWei(amount: number): string;
    createAddress(): Promise<string>;
    getAccounts(): Promise<string[]>;
    getBalance(address: string): Promise<any>;
    unlockAccount(address: string): Promise<{}>;
    send(from: string | object, to?: string, amount?: string): Promise<EthereumTransaction>;
    importAddress(address: string): Promise<void>;
    generate(blockCount: number): Promise<void>;
    checkAllBalances(): Promise<any>;
    getBlock(blockIndex: number): Promise<Block>;
    getBlockNumber(): Promise<number>;
    getGas(): Promise<any>;
}
