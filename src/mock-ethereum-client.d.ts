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
export interface PretendBlock {
    id: number;
    transactions: EthereumTransaction[];
}
export declare class MockEthereumClient implements EthereumClient {
    private addressSource;
    private addresses;
    private blocks;
    private txindex;
    constructor(addressSource: AddressSource);
    createAddress(): Promise<string>;
    getActiveBlock(): PretendBlock;
    private minePreviousBlock(block);
    generate(blockCount: number): Promise<void>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, value: string, gas?: string): Promise<EthereumTransaction>;
    listAllTransactions(address: string, lastblock: any): Promise<EthereumTransaction[]>;
    toWei(amount: number): any;
    fromWei(amount: number): any;
    importAddress(address: string): Promise<void>;
    getAccounts(): Promise<string>;
}
