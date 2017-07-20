import { EthereumClient, EthereumTransaction } from "./types";
export interface Web3EthereumClientConfig {
    http: string;
}
export declare class Web3EthereumClient implements EthereumClient {
    private client;
<<<<<<< HEAD
    private config;
=======
    private web3;
>>>>>>> 09c572b67b76ea31aa0e77fcf55ceb1cf0c4633d
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
}
