import { Web3EthereumClient } from '../src';
export declare class TokenContract {
    private client;
    private web3;
    constructor(client: Web3EthereumClient);
    compileContract(source: any): any;
    loadContract(abi: any): Promise<any>;
    getTotalSupply(abi: any, address: any): Promise<any>;
    getData(abi: any, address: any, from: any): Promise<any>;
    getBalanceOf(abi: any, address: any, from: any): Promise<any>;
    contractGasAndData(abi: any, tokenAddress: any, to: any, value: any): Promise<{
        gas: any;
        data: any;
    }>;
    transfer(abi: any, address: any, from: any, to: any, value: any): Promise<any>;
    getTransactionReceipt(hash: any): Promise<any>;
    watchContract(instance: any, from: any): void;
    setupContract(abi: any, address: any, func: any, from: any, ...params: any[]): void;
}
