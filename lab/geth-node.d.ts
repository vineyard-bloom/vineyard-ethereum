import { Web3EthereumClient } from "../src";
export interface GethNodeConfig {
    gethPath?: string;
}
export declare class GethNode {
    private status;
    private stdout;
    private stderr;
    startChildProcess: any;
    attachChildProcess: any;
    private client;
    private config;
    private static instanceIndex;
    constructor(config?: GethNodeConfig);
    getWeb3(): any;
    getClient(): Web3EthereumClient;
    startMiner(port: any): void;
    start(port: any, flags?: string): Promise<void>;
    attachMiner(port: any): void;
    stopBlockchain(): Promise<{}>;
}
