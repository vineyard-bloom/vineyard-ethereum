import { EthereumClient, EthereumTransaction } from './types';
export declare type TransactionFilter = (transaction) => Promise<boolean>;
export declare type TransactionMap = (transaction) => Promise<EthereumTransaction>;
export declare class BlockScanner<Transaction extends EthereumTransaction> {
    private client;
    private minimumConfirmations;
    private manager;
    constructor(model: any, client: EthereumClient, minimumConfirmations?: number);
    resolveTransaction(transaction: any): Promise<any>;
    private updatePending(newLastBlock);
    gatherTransactions(block: any, transactions: any): Promise<any[]>;
    getTransactions(i: number): Promise<any[]>;
    scanBlocks(i: any, endBlockNumber: any): Promise<any[]>;
    getTransactionsFromRange(lastBlock: any, newLastBlock: any): Promise<any[]>;
    processBlock(blockIndex: any): Promise<void>;
    processBlocks(blockIndex: any, endBlockNumber: any): Promise<void>;
    updateTransactions(): any;
}
