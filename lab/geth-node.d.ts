import { Web3EthereumClient } from "../src";
export declare class GethNode {
    private status;
    private stdout;
    private stderr;
    private childProcess;
    private port;
    private client;
    constructor(port?: number);
    getWeb3(): any;
    getClient(): Web3EthereumClient;
    start(): Promise<void>;
    stop(): Promise<{}>;
}
