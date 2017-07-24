import { EthereumClient } from "../src";
export declare class GethNode {
    private status;
    private stdout;
    private stderr;
    private childProcess1;
    private childProcess2;
    node1: any;
    node2: any;
    client: EthereumClient;
    constructor(client: EthereumClient);
    start(): Promise<void>;
    stop(): Promise<{}>;
}
