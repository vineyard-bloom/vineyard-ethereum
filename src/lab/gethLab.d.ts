import { GethServer } from "./gethServer";
import { EthereumClient } from "vineyard-ethereum";
export interface GethLabConfig {
    address: string;
}
export declare class GethLab {
    server: GethServer;
    client: EthereumClient;
    config: GethLabConfig;
    constructor(config: GethLabConfig, client: EthereumClient, server?: GethServer);
    start(): Promise<any>;
    stop(): Promise<any>;
    reset(): Promise<any>;
    generate(blockCount: number): Promise<void>;
    send(address: string, amount: number): any;
}
