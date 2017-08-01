import { GethNode, GethNodeConfig } from "./geth-node";
export declare class EthereumNetwork {
    private config;
    private nextPort;
    private mainNode;
    private coinbase;
    private enode;
    private nodes;
    constructor(config: GethNodeConfig);
    getCoinbase(): string;
    createNode(): GethNode;
    getMainNode(): GethNode;
    private createGenesisFile(path);
    resetTempDir(): void;
    initialize(): void;
    start(): Promise<void>;
    stop(): any;
}
