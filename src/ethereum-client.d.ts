import { Block, EthereumClient, EthereumTransaction } from "./types";
export interface Web3EthereumClientConfig {
    http: string;
    sweepAddress?: string;
}
export declare class Web3EthereumClient implements EthereumClient {
    private web3;
    private sweepConfig;
    constructor(ethereumConfig: Web3EthereumClientConfig, sweepConfig: any);
    getWeb3(): any;
    getTransaction(txid: any): any;
    getCoinbase(): any;
    toWei(amount: number, type: string): any;
    fromWei(amount: number): any;
    createAddress(): Promise<string>;
    getAccounts(): Promise<string[]>;
    getBalance(address: string): Promise<any>;
    unlockAccount(address: string): any;
    send(from: string | object, to?: string, amount?: string): Promise<EthereumTransaction>;
    importAddress(address: string): Promise<void>;
    generate(blockCount: number): Promise<void>;
    checkAllBalances(): Promise<any>;
    getBlock(blockIndex: number): Promise<Block>;
    getBlockNumber(): Promise<number>;
    getGas(): Promise<any>;
}
