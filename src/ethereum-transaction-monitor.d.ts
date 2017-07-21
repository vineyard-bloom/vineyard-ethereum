import { EthereumClient } from "./types";
export interface GenericEthereumManager<EthereumTransaction> {
    getAddresses(): Promise<string[]>;
    saveTransaction(transaction: EthereumTransaction): any;
    getLastBlock(): Promise<number>;
    setLastBlock(lastblock: number): Promise<void>;
}
export declare class EthereumTransactionMonitor<EthereumTransaction> {
    private ethereumClient;
    private minimumConfirmations;
    private sweepAddress;
    private manager;
    constructor(model: GenericEthereumManager<EthereumTransaction>, ethereumClient: EthereumClient, sweepAddress: string);
    scanAddress(address: string, lastBlock: number): any;
    updateTransactions(): Promise<any>;
}
export declare class EthereumBalanceMonitor<EthereumTransaction> {
    private ethereumClient;
    private minimumConfirmations;
    private sweepAddress;
    private manager;
    constructor(model: GenericEthereumManager<EthereumTransaction>, ethereumClient: EthereumClient, sweepAddress: string);
    private saveNewTransaction(address);
    sweep(): Promise<void>;
}
