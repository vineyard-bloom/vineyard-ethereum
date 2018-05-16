import { GethNode, GethNodeConfig } from './geth-node';
export declare class EthereumNetwork {
    private config;
    private nextPort;
    private coinbase;
    private enodes;
    private nodes;
    constructor(config: GethNodeConfig);
    getCoinbase(): string;
    createNode(): Promise<GethNode>;
    addEnode(node: GethNode): Promise<void>;
    createMiner(): Promise<GethNode>;
    createControlNode(): Promise<GethNode>;
    createMiners(count: number): Promise<GethNode[]>;
    resetTempDir(): void;
    initialize(): void;
    start(): void;
    stop(): any;
    private createGenesisFile(path);
}
export declare function createNetwork(config: GethNodeConfig): EthereumNetwork;
