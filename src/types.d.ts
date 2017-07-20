export interface EthereumTransaction {
    to: string;
    from: string;
    value: any;
    gas: number;
    blockNumber: number;
}
export interface EthereumClient {
    createAddress(): Promise<string>;
    getBalance(address: string): Promise<number>;
    send(fromAddress: string, toAddress: string, value: string, gas?: string): Promise<EthereumTransaction>;
    importAddress(address: string): Promise<void>;
    listAllTransactions(address: string, lastblock: any): Promise<EthereumTransaction[]>;
    getAccounts(): Promise<string>;
    generate(blockCount: number): Promise<void>;
}
export interface AddressSource {
    generateAddress(): Promise<string>;
}
export declare const gasWei: any;
