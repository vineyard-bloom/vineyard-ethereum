import { EthereumClient, GenericEthereumManager, EthereumTransaction } from "./types";
export declare class EthereumTransactionMonitor<Transaction extends EthereumTransaction> {
    private ethereumClient;
    private minimumConfirmations;
    private sweepAddress;
    private manager;
    constructor(model: GenericEthereumManager<Transaction>, ethereumClient: EthereumClient, sweepAddress: string, minimumConfirmations?: number);
    private resolveTransaction(transaction);
    private updatePending(newLastBlock);
    processBlock(blockIndex: any): Promise<void>;
    processBlocks(blockIndex: any, endBlockNumber: any): Promise<void>;
    updateTransactions(): Promise<void>;
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
