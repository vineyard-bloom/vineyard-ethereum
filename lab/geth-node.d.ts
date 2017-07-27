import { EthereumClient } from "../src";
export declare class GethNode {
    private status;
    private stdout;
    private stderr;
    private childProcess;
    node: any;
    client: EthereumClient;
    constructor();
    getClient(): any;
    start(): void;
    stop(): Promise<{}>;
}
