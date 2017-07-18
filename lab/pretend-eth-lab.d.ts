import { EthLab } from "./eth-lab";
import { MockEthereumClient } from "../src/ethereum-client";
import { EthereumTransaction } from "../src";
export declare class PretendEthLab implements EthLab {
    client: MockEthereumClient;
    constructor(client: MockEthereumClient);
    start(): Promise<void>;
    send(amount: number): Promise<EthereumTransaction>;
    getSweepAddress(): string;
}
