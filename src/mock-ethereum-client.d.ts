import { AddressSource, Block, EthereumClient, EthereumTransaction } from "./types";
import { BlockInfo, FullBlock, ExternalSingleTransaction as ExternalTransaction } from "vineyard-blockchain";
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
    blockNumber(blocks: any): Promise<{}>;
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
    getBlockIndex(): Promise<number>;
    getActiveBlock(): Block;
    getLastBlock(): Promise<BlockInfo>;
    getTransaction(txid: string): any;
    getNextBlockInfo(previousBlock: BlockInfo): Promise<BlockInfo>;
    getTransactionStatus(txid: string): Promise<number>;
    getFullBlock(block: BlockInfo): Promise<FullBlock<ExternalTransaction>>;
    private minePreviousBlock(block);
    generate(blockCount: number): Promise<void>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, value: string, gas?: string): Promise<EthereumTransaction>;
    toWei(amount: number): any;
    fromWei(amount: number): any;
    importAddress(address: string): Promise<void>;
    getAccounts(): Promise<string>;
    getBlock(blockIndex: number): Promise<Block>;
    getBlockNumber(): Promise<number>;
    getGas(): Promise<number>;
}
