import { Web3EthereumClient } from '../src';
export declare class TokenContract {
    private client;
    private web3;
    constructor(client: Web3EthereumClient);
    compileContract(source: any): any;
    loadContract(abi: any): Promise<any>;
    getTotalSupply(abi: any, address: string): Promise<any>;
    getData(abi: any, address: string, from: string): Promise<any>;
    getBalanceOf(abi: any, address: string, from: string): Promise<any>;
    transfer(abi: any, address: string, from: string, to: string, value: any): Promise<any>;
    getTransactionReceipt(hash: string): Promise<any>;
    watchContract(instance: any, from: string): void;
    setupContract(abi: any, address: string, func: any, from: string, ...params: any[]): void;
}
