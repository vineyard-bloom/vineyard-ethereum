import { GethServer } from './gethServer';
import { EthereumClient } from '../src/';
import { EthLab } from './eth-lab';
export interface GethLabConfig {
    address: string;
}
export declare class GethLab implements EthLab {
    server: GethServer;
    client: EthereumClient;
    config: GethLabConfig;
    defaultAddress: string;
    constructor(config: GethLabConfig, client: EthereumClient, server?: GethServer);
    getSweepAddress(): string;
    start(): Promise<void>;
    stop(): Promise<any>;
    reset(): Promise<any>;
    send(address: string, amount: any): Promise<void>;
    generate(blockCount: number): Promise<any>;
}
