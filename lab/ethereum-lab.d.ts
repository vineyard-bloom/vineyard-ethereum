import { EthereumNetwork } from './ethereum-network';
import { GethNode } from './geth-node';
export declare class EthereumLab {
    network: EthereumNetwork;
    miner: GethNode;
    constructor(coinbaseAddress?: string);
    start(): Promise<void>;
    stop(): Promise<void>;
    send(address: string, amount: number): Promise<void>;
    reset(): Promise<any>;
}
