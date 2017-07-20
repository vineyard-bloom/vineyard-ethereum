export interface EthereumTransaction {
    to: string;
    from: string;
    wei: string;
    gas: string;
}
export interface Web3EthereumClientConfig {
    http: string;
}
export interface EthereumClient {
    createAddress(): Promise<string>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, value: string, gas?: string): Promise<EthereumTransaction>;
    importAddress(address: string): Promise<void>;
    listAllTransactions(): Promise<any[]>;
    getAccounts(): Promise<string>;
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
    createAddress(): Promise<string>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, value: string, gas?: string): Promise<EthereumTransaction>;
    listAllTransactions(): Promise<any[]>;
    toWei(amount: number): any;
    fromWei(amount: number): any;
    importAddress(address: string): Promise<void>;
    getAccounts(): Promise<string>;
}
export declare class Web3EthereumClient implements EthereumClient {
    private client;
    constructor(ethereumConfig: Web3EthereumClientConfig);
    getClient(): this;
    getSweepAddress(): Promise<any>;
    toWei(amount: number): any;
    fromWei(amount: number): any;
    createAddress(): Promise<string>;
    getAccounts(): Promise<string>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, amount: string, gas?: string): Promise<EthereumTransaction>;
    listAllTransaction(address: string, lastblock: number): any;
    importAddress(address: string): Promise<void>;
}
