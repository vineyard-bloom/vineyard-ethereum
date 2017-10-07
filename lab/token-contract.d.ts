import { Web3EthereumClient } from "../src";
export declare class TokenContract {
    private client;
    private web3;
    constructor(client: Web3EthereumClient);
    compileContract(source: any): any;
    loadContract(abi: any): any;
    interactWithContract(abi: any, address: any, func: any, from: any, ...params: any[]): void;
}
