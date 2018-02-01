import { Web3EthereumClient } from '../src';
export interface GethNodeConfig {
    gethPath?: string;
    verbosity?: number;
    tempPath?: string;
    port?: number;
    index?: number;
    bootnodes?: string;
    coinbase: string;
    enodes?: string[];
}
export declare class GethNode {
    private static instanceIndex;
    private stdout;
    private stderr;
    private childProcess;
    private client;
    private config;
    private datadir;
    private keydir;
    private port?;
    private index;
    constructor(config?: GethNodeConfig, port?: number);
    getWeb3(): any;
    getClient(): Web3EthereumClient;
    getKeydir(): string;
    startMining(): Promise<void>;
    getBootNodeFlags(): string;
    getCommonFlags(): string;
    getRPCFlags(): string;
    start(flags?: string): Promise<void>;
    execSync(suffix: string): any;
    initialize(genesisPath: string): Promise<void>;
    getNodeUrl(): string;
    isRunning(): boolean;
    isConnected(): any;
    mineBlocks(blockCount: number): Promise<any>;
    addPeer(enode: string): void;
    listPeers(): void;
    stop(): Promise<void> | Promise<{}>;
    mine(milliseconds: number): Promise<any>;
    private launch(flags);
}
