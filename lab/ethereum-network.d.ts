import { GethNode, GethNodeConfig } from "./geth-node";
export declare class EthereumNetwork {
    private config;
    private nextPort;
    private mainNode;
    private coinbase;
    private enode;
    constructor(config: GethNodeConfig);
    createNode(): GethNode;
    getMainNode(): GethNode;
    private createGenesisFile(path);
    resetTempDir(): void;
    initialize(): void;
    start(): Promise<void>;
}
