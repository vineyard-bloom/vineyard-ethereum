import { Web3EthereumClient } from "../src";
export interface GethNodeConfig {
    gethPath?: string;
    verbosity?: number;
}
export declare class GethNode {
    private stdout;
    private stderr;
    private childProcess;
    private client;
    private config;
    private static instanceIndex;
    private datadir;
    private keydir;
    private port;
    private index;
    constructor(config?: GethNodeConfig, port?: any);
    getWeb3(): any;
    getClient(): Web3EthereumClient;
    startMining(): Promise<void>;
    start(flags?: string): Promise<void>;
    isRunning(): boolean;
    stop(): Promise<{}>;
    static initialize(): Promise<{}>;
    mine(milliseconds: number): any;
}
