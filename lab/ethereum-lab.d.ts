import { EthereumNetwork, Keystore } from './ethereum-network';
export declare class EthereumLab {
    network: EthereumNetwork;
    constructor(tempPath: string, startingPort: number, gethPath?: string, keystore?: Keystore);
    start(): Promise<void>;
    stop(): Promise<void>;
    send(address: string, amount: number): Promise<void>;
    reset(): Promise<any>;
}
