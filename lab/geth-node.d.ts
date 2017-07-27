import { Web3EthereumClient } from "../src";
export interface GethNodeConfig {
    gethPath?: string;
}
export declare class GethNode {
    private status;
    private stdout;
    private stderr;
    private childProcess;
    private client;
    private config;
    constructor(config?: GethNodeConfig);
    getWeb3(): any;
    getClient(): Web3EthereumClient;
    start(port: any): Promise<void>;
    stop(): Promise<{}>;
}
