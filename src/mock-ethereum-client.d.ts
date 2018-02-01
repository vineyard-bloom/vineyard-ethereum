import { AddressSource } from './types';
export declare class PredefinedAddressSource implements AddressSource {
    private addresses;
    private index;
    constructor(addresses: string[]);
    generateAddress(): Promise<string>;
}
export declare class RandomAddressSource implements AddressSource {
    generateAddress(): Promise<string>;
}
export declare class MockEth {
    coinbase: string;
    constructor();
    getBalance(address: any): any;
    getBlock(blockNumber: number, blocks: any[], cb: any): any;
    blockNumber(blocks: any[]): Promise<{}>;
    getTransaction(txid: string, transactions: any): any;
}
export declare class MockWeb3 {
    mockEth: MockEth;
    constructor(mockEth: MockEth);
}
