import { EthereumClient, EthereumTransaction } from './types';
export declare type TransactionFilter = (transaction) => Promise<boolean>;
export declare type TransactionMap = (transaction) => Promise<EthereumTransaction>;
export declare class BlockScanner<Transaction extends EthereumTransaction> {
    private client;
    private minimumConfirmations;
    private manager;
    constructor(model: any, client: EthereumClient, minimumConfirmations?: number);
    private resolveTransaction(transaction);
    private updatePending(newLastBlock);
    createTransaction(e: any, block: any): {
        hash: any;
        nonce: any;
        blockHash: any;
        blockNumber: any;
        transactionIndex: any;
        from: any;
        to: any;
        value: any;
        time: Date;
        gasPrice: any;
        gas: any;
        input: any;
    };
    gatherTransactions(block: any, transactions: any): Promise<any[]>;
    getTransactions(i: number): Promise<any[]>;
    scanBlocks(i: any, endBlockNumber: any): Promise<any[]>;
    getTransactionsFromRange(lastBlock: any, newLastBlock: any): Promise<any[]>;
    processBlock(blockIndex: any): Promise<void>;
    processBlocks(blockIndex: any, endBlockNumber: any): Promise<void>;
    updateTransactions(): any;
}
