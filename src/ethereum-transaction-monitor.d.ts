import { EthereumClient, EthereumTransactionOld, GenericEthereumManager } from './types';
export declare class EthereumTransactionMonitor<Transaction extends EthereumTransactionOld> {
    private ethereumClient;
    private minimumConfirmations;
    private sweepAddress;
    private manager;
    constructor(model: GenericEthereumManager<Transaction>, ethereumClient: EthereumClient, sweepAddress: string, minimumConfirmations?: number);
    processBlock(blockIndex: number): Promise<void>;
    processBlocks(blockIndex: number, endBlockNumber: number): Promise<void>;
    updateTransactions(): Promise<void>;
    private resolveTransaction(transaction);
    private updatePending(newLastBlock);
}
