import { EthereumClient } from "./types";
export interface GenericEthereumManager<EthereumTransaction> {
    getAddresses(): Promise<string[]>;
    saveTransaction(transaction: EthereumTransaction): any;
    getLastBlock(): Promise<string>;
    setLastBlock(lastblock: string): Promise<void>;
}
export declare class EthereumTransactionMonitor<EthereumTransaction> {
    private ethereumClient;
    private minimumConfirmations;
    private sweepAddress;
    private manager;
    constructor(model: GenericEthereumManager<EthereumTransaction>, ethereumClient: EthereumClient, sweepAddress: string);
    private saveNewTransaction(address);
    sweep(): Promise<void>;
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
