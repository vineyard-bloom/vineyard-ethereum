import { Web3EthereumClient } from "../src";
export interface GethNodeConfig {
    gethPath?: string;
    verbosity?: number;
    tempPath?: string;
    port?: number;
    index?: number;
    bootnodes?: string;
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
    getKeydir(): string;
    startMining(): Promise<void>;
    private launch(flags);
    getBootNodeFlags(): string;
    getCommonFlags(): string;
    getRPCFlags(): string;
    start(flags?: string): Promise<void>;
    execSync(suffix: string): any;
    initialize(genesisPath: string): Promise<void>;
    getNodeUrl(): string;
    isRunning(): boolean;
    isConnected(): any;
    stop(): Promise<{}>;
    mine(milliseconds: number): Promise<{}>;
}
