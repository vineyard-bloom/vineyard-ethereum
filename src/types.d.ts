import BigNumber from 'bignumber.js';
import Bristle from './sweep.js';
import { ReadClient, SingleTransaction as Transaction, ExternalSingleTransaction as ExternalTransaction } from "vineyard-blockchain";
export interface FakeBlock {
}
export interface EthereumTransaction {
    to: string;
    from: string;
    value: any;
    gas: number;
    hash: number;
    contractAddress?: string;
}
export interface Web3TransactionReceipt {
    blockHash: string;
    blockNumber: number;
    transactionHash: string;
    transactionIndex: number;
    from: string;
    to: string;
    cumulativeGasUsed: number;
    gasUsed: number;
    contractAddress: string;
    logs: {}[];
    status: string;
}
export interface Block {
    transactions: Transaction[];
    hash: string;
    number: number;
    timestamp: number;
}
export interface AddressManager {
    hasAddress(address: string): Promise<boolean>;
}
export interface EthereumClient extends ReadClient<ExternalTransaction> {
    checkAllBalances(): Promise<any>;
    createAddress(): Promise<string>;
    getBalance(address: string): Promise<any>;
    send(fromAddress: string, toAddress: string, value: string, gasPrice?: string): Promise<EthereumTransaction>;
    importAddress(address: string): Promise<void>;
    getAccounts(): Promise<string[]>;
    generate(blockCount: number): Promise<void>;
    getBlock(blockIndex: number): Promise<Block>;
    getBlockNumber(): Promise<number>;
    getCoinbase(): Promise<string>;
    getTransaction(txid: string): Promise<ExternalTransaction>;
    getGas(): Promise<BigNumber>;
}
export interface AddressSource {
    generateAddress(): Promise<string>;
}
export declare const gasWei: any;
export interface GenericEthereumManager<EthereumTransaction> extends AddressManager {
    saveTransaction(transaction: EthereumTransaction, blockIndex: number): any;
    getLastBlock(): Promise<number>;
    setLastBlock(lastblock: number): Promise<void>;
    getResolvedTransactions(confirmedBlockNumber: number): Promise<EthereumTransaction[]>;
    onConfirm(transaction: EthereumTransaction): Promise<EthereumTransaction>;
    onDenial(transaction: EthereumTransaction): Promise<EthereumTransaction>;
    setStatus(transaction: EthereumTransaction, value: any): Promise<EthereumTransaction>;
}
export interface SweepManager {
    saveSweepRecord(bristle: Bristle): Promise<any>;
    getDustyAddresses(): Promise<string[]>;
}
