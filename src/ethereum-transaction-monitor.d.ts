import { EthereumClient } from './ethereum-client';
export interface GenericEthereumManager<Transaction> {
    getAddresses(): Promise<string[]>;
    saveTransaction(transaction: Transaction): any;
}
export declare class EthereumTransactionMonitor<Transaction> {
    private ethereumClient;
    private minimumConfirmations;
    private sweepAddress;
    private manager;
    constructor(model: GenericEthereumManager<Transaction>, ethereumClient: EthereumClient, sweepAddress: string);
    private saveNewTransaction(address);
    sweep(): Promise<void>;
}
