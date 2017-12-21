import { BaseBlock, BlockInfo, ExternalSingleTransaction as ExternalTransaction, FullBlock, ReadClient, TransactionStatus } from 'vineyard-blockchain/src/types';
import { Web3EthereumClientConfig } from './ethereum-client';
import { Block, Web3TransactionReceipt } from './types';
export declare class TokenClient implements ReadClient<ExternalTransaction> {
    private web3;
    private tokenContractAddress;
    private currency;
    private methodIDs;
    private abi;
    constructor(ethereumConfig: Web3EthereumClientConfig, currency: number, tokenContractAddress: string, abi: object);
    getBlockIndex(): Promise<number>;
    getLastBlock(): Promise<BaseBlock>;
    getTransactionStatus(txid: string): Promise<TransactionStatus>;
    getNextBlockInfo(previousBlock: BlockInfo | undefined): Promise<BaseBlock | undefined>;
    getFullBlock(block: BlockInfo): Promise<FullBlock<ExternalTransaction>>;
    getBlock(blockIndex: number): Promise<Block>;
    getBlockNumber(): Promise<number>;
    getTransactionReceipt(txid: string): Promise<Web3TransactionReceipt>;
    filterTokenTransaction(transactions: ExternalTransaction[]): ExternalTransaction[];
    decodeTransactions(transactions: any[]): Promise<any[]>;
    decodeTransaction(transaction: any): {
        to: any;
        value: any;
    };
    decodeMethod(data: any): {
        name: any;
        params: any;
    } | undefined;
    addAbi(abiArray: any): any[];
}
