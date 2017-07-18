import { GethServer } from "./gethServer";
import { EthereumClient } from "vineyard-ethereum";
import { EthLab } from "./eth-lab";
export interface GethLabConfig {
    address: string;
}
export declare class GethLab implements EthLab {
    server: GethServer;
    client: EthereumClient;
    config: GethLabConfig;
    defaultAddress: string;
    constructor(config: GethLabConfig, client: EthereumClient, server?: GethServer);
    start(): Promise<void>;
    stop(): Promise<any>;
    reset(): Promise<any>;
    send(address: string, amount: number): Promise<void>;
}
