export interface EthereumTransaction {
}
export interface EthereumConfig {
    http: string;
}
export interface EthereumClient {
    generateAddress(): Promise<string>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, amount: number): Promise<EthereumTransaction>;
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
export declare class MockEthereumClient implements EthereumClient {
    private addressSource;
    private addresses;
    constructor(addressSource: AddressSource);
    generateAddress(): Promise<string>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, amount: number): Promise<EthereumTransaction>;
}
export declare class Web3EthereumClient implements EthereumClient {
    private client;
    constructor(ethereumConfig: EthereumConfig);
    getClient(): any;
    toWei(amount: number): any;
    generateAddress(): Promise<string>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, amount: number): Promise<EthereumTransaction>;
}
