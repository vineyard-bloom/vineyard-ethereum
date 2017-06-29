export interface EthereumConfig {
    http: string;
}
export interface EthereumClient {
    generateAddress(): Promise<string>;
    getBalance(address: any): Promise<number>;
    send(fromAddress: string, toAddress: string, amount: number): Promise<any>;
}
export declare class Web3EthereumClient implements EthereumClient {
    private client;
    constructor(ethereumConfig: EthereumConfig);
    getClient(): any;
    toWei(amount: number): any;
    generateAddress(): Promise<string>;
    getBalance(address: any): Promise<number>;
    send(fromAddress: string, toAddress: string, amount: number): Promise<any>;
}
