import { EthereumClient, EthereumTransaction } from './types';
export declare class BlockScanner<Transaction extends EthereumTransaction> {
    private client;
    private minimumConfirmations;
    private manager;
    constructor(model: any, client: EthereumClient, minimumConfirmations?: number);
    gatherTransactions(block: any, transactions: any): Promise<any[]>;
    getTransactions(i: number): Promise<any[]>;
    scanBlocks(i: number, endBlockNumber: number): Promise<any[]>;
    getTransactionsFromRange(lastBlock: number, newLastBlock: number): Promise<any[]>;
    processBlock(blockIndex: number): Promise<void>;
    processBlocks(blockIndex: number, endBlockNumber: number): Promise<void>;
    updateTransactions(): any;
    private resolveTransaction(transaction);
    private updatePending(newLastBlock);
}
