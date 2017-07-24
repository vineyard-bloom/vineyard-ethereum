import { EthereumClient, EthereumTransaction } from "./types";
export interface Web3EthereumClientConfig {
    http: string;
    sweepAddress: string;
}
export declare class Web3EthereumClient implements EthereumClient {
    private client;
    private web3;
    constructor(ethereumConfig: Web3EthereumClientConfig);
    getClient(): this;
    getSweepAddress(): Promise<any>;
    toWei(amount: number): any;
    fromWei(amount: number): any;
    createAddress(): Promise<string>;
    getAccounts(): Promise<string>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, amount: string, gas?: string): Promise<EthereumTransaction>;
    listAllTransactions(address: string, lastblock: number): Promise<EthereumTransaction[]>;
    importAddress(address: string): Promise<void>;
    generate(blockCount: number): Promise<void>;
    getGas(): Promise<number>;
}
