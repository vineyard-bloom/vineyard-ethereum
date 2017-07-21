import { EthLab } from "./eth-lab";
import { EthereumTransaction, MockEthereumClient } from "../src";
export declare class PretendEthLab implements EthLab {
    client: MockEthereumClient;
    constructor(client: MockEthereumClient);
    start(): Promise<void>;
    stop(): Promise<any>;
    reset(): Promise<any>;
    send(address: string, amount: any): Promise<EthereumTransaction>;
    getSweepAddress(): string;
    generate(blockCount: number): Promise<any>;
}
