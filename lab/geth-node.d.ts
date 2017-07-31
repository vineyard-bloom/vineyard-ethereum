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
    private static instanceIndex;
    constructor(config?: GethNodeConfig);
    getWeb3(): any;
    getClient(): Web3EthereumClient;
    startMiner(port: any): Promise<void>;
    start(port: any, flags?: string): Promise<void>;
    stop(): Promise<{}>;
    static initialize(): Promise<{}>;
}
export declare function mine(node: any, port: any, milliseconds: number): Promise<void>;
