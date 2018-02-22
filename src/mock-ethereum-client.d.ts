import { AddressSource, Block, EthereumClient, EthereumTransaction } from "./types";
export declare class PredefinedAddressSource implements AddressSource {
    private addresses;
    private index;
    constructor(addresses: string[]);
    generateAddress(): Promise<string>;
}
export declare class RandomAddressSource implements AddressSource {
    generateAddress(): Promise<string>;
}
export declare class MockEthereumClient implements EthereumClient {
    private addressSource;
    private addresses;
    private blocks;
    private txindex;
    constructor(addressSource: AddressSource);
    createAddress(): Promise<string>;
    getActiveBlock(): Block;
    private minePreviousBlock(block);
    generate(blockCount: number): Promise<void>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, value: string, gas?: string): Promise<EthereumTransaction>;
    toWei(amount: number): string;
    fromWei(amount: number): string;
    importAddress(address: string): Promise<void>;
    getAccounts(): Promise<string>;
    getBlock(blockIndex: number): Promise<Block>;
    getBlockNumber(): Promise<number>;
    getGas(): Promise<number>;
}
