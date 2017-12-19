import { EthereumClient, GenericEthereumManager, EthereumTransaction } from "./types";
export declare class EthereumTransactionMonitor<Transaction extends EthereumTransaction> {
    private ethereumClient;
    private minimumConfirmations;
    private sweepAddress;
    private manager;
    constructor(model: GenericEthereumManager<Transaction>, ethereumClient: EthereumClient, sweepAddress: string, minimumConfirmations?: number);
    private resolveTransaction(transaction);
    private updatePending(newLastBlock);
    processBlock(blockIndex: number): Promise<void>;
    processBlocks(blockIndex: number, endBlockNumber: number): Promise<void>;
    updateTransactions(): Promise<void>;
}
