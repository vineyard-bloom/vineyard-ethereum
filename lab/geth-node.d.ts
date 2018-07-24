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
    private childProcess;
    private client;
    private config;
    private datadir;
    private keydir;
    private rpcPort?;
    private index;
    private isMiner;
    private rpcRequestId;
    constructor(config?: GethNodeConfig, port?: number);
    getWeb3(): any;
    getClient(): Web3EthereumClient;
    getKeydir(): string;
    getBootNodeFlags(): string;
    getCommonFlags(): string;
    getRPCFlags(): string;
    getEtherbaseFlags(): string;
    start(flags?: string): Promise<void>;
    startMining(): Promise<void>;
    execSync(suffix: string): any;
    initialize(genesisPath: string): void;
    invoke(method: string, params?: any[]): Promise<any>;
    getNodeUrl(): Promise<string>;
    isRunning(): boolean;
    isConnected(): any;
    mineBlocks(blockCount: number, timeout?: number): Promise<any>;
    addPeer(enode: string): Promise<void>;
    listPeers(): void;
    stop(): Promise<void> | Promise<{}>;
    private launch(flags);
}
