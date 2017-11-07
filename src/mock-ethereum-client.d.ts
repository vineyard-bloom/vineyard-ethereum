import { AddressSource, Block, EthereumClient, EthereumTransaction } from "./types";
import { BlockInfo, FullBlock, Address } from "vineyard-blockchain";
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
    getBalance(address: Address): any;
    getBlock(blockNumber: number, blocks: Block[], cb: any): Block;
    blockNumber(blocks: Block[], cb: any): Block;
    getTransaction(txid: string, transactions: EthereumTransaction[]): any;
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
    getLastBlock(): Promise<BlockInfo>;
    getNextBlockInfo(previousBlock: BlockInfo): Promise<BlockInfo>;
    getTransactionStatus(txid: string): Promise<number>;
    getFullBlock(block: BlockInfo): Promise<FullBlock>;
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
