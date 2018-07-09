import BigNumber from 'bignumber.js';
import { ExternalSingleTransaction as ExternalTransaction } from 'vineyard-blockchain';
import { Bristle } from './sweep';
export interface FakeBlock {
}
export interface GasTransaction {
    txid: string;
    address: string;
}
export interface EthereumTransactionOld {
    to: string;
    from: string;
    value: any;
    gas: number;
    hash: number;
    contractAddress?: string;
}
export interface EthereumTransaction {
    to: string;
    from: string;
    value: any;
    gas: number;
    gasPrice: BigNumber;
    hash: string;
}
export interface Web3Transaction {
    hash: string;
    to: string;
    from: string;
    value: BigNumber;
    block: string;
    status: string;
    gasPrice: BigNumber;
    nonce: number;
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
export interface Web3Block {
    hash: string;
    index: number;
    number: number;
    miner: string;
    timeMined: Date;
    parentHash: string;
    difficulty: string;
    sha3Uncles: string;
    stateRoot: string;
    transactionsRoot: string;
    receiptRoot?: string;
    receiptsRoot?: string;
    logsBloom: string;
    gasLimit: number;
    gasUsed: number;
    timestamp: number;
    extraData: string;
    mixHash: string;
    nonce: number;
    rlp: string;
    transactions: Web3Transaction[];
}
export interface Block {
    transactions: Web3Transaction[];
    hash: string;
    number: number;
    timestamp: number;
}
export interface AddressManager {
    hasAddress(address: string): Promise<boolean>;
}
export interface EthereumClient {
    checkAllBalances(): Promise<any>;
    createAddress(): Promise<string>;
    getBalance(address: string): Promise<any>;
    send(fromAddress: string, toAddress: string, value: string, gasPrice?: string): Promise<EthereumTransactionOld>;
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
export declare const gasWei: BigNumber;
export interface GenericEthereumManager<EthereumTransaction> extends AddressManager {
    saveTransaction(transaction: EthereumTransaction, blockIndex: number): Promise<any>;
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
    saveGasTransaction(gasTransaction: GasTransaction): Promise<GasTransaction | undefined>;
}
