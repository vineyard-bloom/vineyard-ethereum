export interface EthereumTransaction {
}
export interface Web3EthereumClientConfig {
    http: string;
}
export interface EthereumClient {
    generateAddress(): Promise<string>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, value: number, gas?: number): Promise<EthereumTransaction>;
    generate(address: string, amount: number): Promise<void>;
    importAddress(address: string): Promise<void>;
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
export declare class MockEthereumClient implements EthereumClient {
    private addressSource;
    private addresses;
    constructor(addressSource: AddressSource);
    generateAddress(): Promise<string>;
    generate(address: string, amount: number): Promise<void>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, value: number, gas?: number): Promise<EthereumTransaction>;
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
    generate(address: string, amount: number): Promise<void>;
    importAddress(address: string): Promise<void>;
}
