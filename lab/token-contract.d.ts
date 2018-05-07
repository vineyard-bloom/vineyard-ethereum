import { Web3EthereumClient } from '../src';
export declare class TokenContract {
    private client;
    private web3;
    private abi;
    private contract;
    private rawCompiledContract;
    constructor(client: Web3EthereumClient, abi?: any);
    compileContract(source: any): any;
    getContract(abi: any): any;
    loadContract(address: string): {};
    getTotalSupply(abi: any, address: string): any;
    getData(abi: any, address: string, from: string): any;
    getBalanceOf(abi: any, address: string, from: string): any;
    transfer(abi: any, address: string, from: string, to: string, value: any): any;
    getTransactionReceipt(hash: string): any;
    watchContract(instance: any, from: string): void;
    setupContract(abi: any, address: string, func: any, from: string, ...params: any[]): void;
}
