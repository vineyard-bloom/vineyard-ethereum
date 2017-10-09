import { EthereumClient } from './types';
export declare type TransactionFilter = (transaction) => Promise<boolean>;
export declare type TransactionMap = (transaction) => any;
export declare class BlockScanner {
    client: EthereumClient;
    transactionFilter: TransactionFilter;
    transactionMap: TransactionMap;
    constructor(client: EthereumClient, transactionFilter: TransactionFilter, transactionMap: TransactionMap);
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
}
