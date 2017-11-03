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
export declare class MockEth {
    coinbase: string;
    constructor();
    getBalance(address: any): any;
    getBlock(blockNumber: any, blocks: any, cb: any): any;
    getTransaction(txid: any, transactions: any): any;
}
export declare class MockWeb3 {
    mockEth: MockEth;
    constructor(mockEth: MockEth);
}
export declare class MockEthereumClient implements EthereumClient {
    private addressSource;
    private addresses;
    private blocks;
    private txindex;
    private mockWeb3;
    constructor(addressSource: AddressSource, mockWeb3: MockWeb3);
    createAddress(): Promise<string>;
    getActiveBlock(): Block;
    getTransaction(txid: string): any;
    getNextBlockInfo(previousBlock: number): any;
    getFullBlock(block: Block): {
        hash: string;
        index: number;
        timeMined: number;
        transactions: EthereumTransaction[];
    };
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
