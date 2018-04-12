import BigNumber from 'bignumber.js';
import { EthereumTransaction, Web3Transaction } from '../src';
export declare class MockWeb3 {
    eth: MockEth;
    personal: MockPersonal;
    constructor();
    setProvider(): void;
}
export declare class MockEth {
    transactions: Web3Transaction[];
    coinbase: string;
    getAccounts: Function;
    constructor();
    getGasPrice(): number;
    getBalance(address: string, callback: Function): BigNumber;
    getBlock(hashOrNumber: string, includeTxs: boolean, callback: Function): any;
    getBlockNumber(callback: Function): any;
    getTransaction(hash: string): Web3Transaction;
    getTransactionReceipt(txHash: string, callback: Function): void;
    sendTransaction(transaction: EthereumTransaction, callback: Function): any;
}
export declare class MockPersonal {
    accounts: string[];
    constructor();
    unlockAccount(address: string, callback: Function): any;
    newAccount(callback: Function): any;
    getAccounts(): Promise<string[]>;
}
