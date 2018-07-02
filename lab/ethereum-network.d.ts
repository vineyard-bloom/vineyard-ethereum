import { GethNode } from './geth-node';
export interface Keystore {
    address: string;
    path: string;
    jsonData: string;
}
export declare const defaultKeystore: {
    address: string;
    path: string;
    jsonData: string;
};
export interface EthereumNetworkConfig {
    tempPath: string;
    startingPort: number;
    gethPath: string;
    keystore: Keystore;
}
export declare class EthereumNetwork {
    private config;
    private currentPort;
    private coinbase;
    mainNode?: GethNode;
    private nodes;
    constructor(config: EthereumNetworkConfig);
    getCoinbase(): string;
    createNode(): Promise<GethNode>;
    createControlNode(): Promise<GethNode>;
    resetTempDir(): void;
    initialize(): Promise<GethNode>;
    stop(): any;
    private createGenesisFile(path);
}
export declare function createNetwork(config: EthereumNetworkConfig): EthereumNetwork;
