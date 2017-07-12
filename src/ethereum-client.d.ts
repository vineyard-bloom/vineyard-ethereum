export interface EthereumTransaction {
}
export interface Web3EthereumClientConfig {
    http: string;
}
export interface EthereumClient {
    generateAddress(): Promise<string>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, value: string, gas?: number): Promise<EthereumTransaction>;
    generate(address: string, amount: string): Promise<void>;
    importAddress(address: string): Promise<void>;
    listAllTransactions(): Promise<any[]>;
}
export interface AddressSource {
    generateAddress(): Promise<string>;
}
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
    generateAddress(): Promise<string>;
    generate(address: string, amount: string): Promise<void>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, value: string, gas?: number): Promise<EthereumTransaction>;
    importAddress(address: string): Promise<void>;
}
export declare class Web3EthereumClient implements EthereumClient {
    private client;
    constructor(ethereumConfig: Web3EthereumClientConfig);
    getClient(): any;
    toWei(amount: number): any;
    fromWei(amount: number): number;
    generateAddress(): Promise<string>;
    getAccounts(): Promise<string>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, amount: number, gas?: number): Promise<EthereumTransaction>;
    listAllTransaction(address: string, lastblock: number): any;
    generate(address: string, amount: number): Promise<void>;
    importAddress(address: string): Promise<void>;
}
