import { EthereumTransaction, GethTransaction } from '../src';
export declare class MockWeb3 {
    eth: MockEth;
    personal: MockPersonal;
    constructor();
    setProvider(): void;
}
export declare class MockEth {
    transactions: GethTransaction[];
    coinbase: string;
    getAccounts: Function;
    constructor();
    getGasPrice(): number;
    getBalance(address: string, callback: Function): number;
    getBlock(hashOrNumber: string, includeTxs: boolean, callback: Function): any;
    getBlockNumber(callback: Function): any;
    getTransaction(hash: string): GethTransaction;
    getTransactionReceipt(txHash: string, callback: Function): void;
    sendTransaction(transaction: EthereumTransaction, callback: Function): any;
}
export declare class MockPersonal {
    accounts: string[];
    constructor();
    unlockAccount(address: string, callback: Function): void;
    newAccount(): string;
    getAccounts(): Promise<string[]>;
}
