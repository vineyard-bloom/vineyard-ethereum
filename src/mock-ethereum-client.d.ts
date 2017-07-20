import { AddressSource, EthereumClient, EthereumTransaction } from "./types";
export declare class PredefinedAddressSource implements AddressSource {
    private addresses;
    private index;
    constructor(addresses: string[]);
    generateAddress(): Promise<string>;
}
export declare class RandomAddressSource implements AddressSource {
    generateAddress(): Promise<string>;
}
export interface PretendTransaction {
    wei: number;
}
export interface PretendBlock {
    id: string;
    transactions: PretendTransaction[];
}
export declare class MockEthereumClient implements EthereumClient {
    private addressSource;
    private addresses;
    private blockchain;
    constructor(addressSource: AddressSource);
    createAddress(): Promise<string>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, value: string, gas?: string): Promise<EthereumTransaction>;
    listAllTransactions(): Promise<any[]>;
    toWei(amount: number): any;
    fromWei(amount: number): any;
    importAddress(address: string): Promise<void>;
    getAccounts(): Promise<string>;
}
