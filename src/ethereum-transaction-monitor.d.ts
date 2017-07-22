import { EthereumClient, GenericEthereumManager } from "./types";
export declare class EthereumTransactionMonitor<EthereumTransaction> {
    private ethereumClient;
    private minimumConfirmations;
    private sweepAddress;
    private manager;
    constructor(model: GenericEthereumManager<EthereumTransaction>, ethereumClient: EthereumClient, sweepAddress: string);
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
