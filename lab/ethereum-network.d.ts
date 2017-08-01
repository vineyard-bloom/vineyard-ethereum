import { GethNode, GethNodeConfig } from "./geth-node";
export declare class EthereumNetwork {
    private config;
    nextPort: number;
    constructor(config: GethNodeConfig);
    createNode(): GethNode;
}
