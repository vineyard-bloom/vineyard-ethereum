import { EthLab } from "./eth-lab";
import { MockEthereumClient } from "../src/ethereum-client";
export declare class PretendEthLab implements EthLab {
    client: MockEthereumClient;
    constructor(client: MockEthereumClient);
    start(): Promise<void>;
    generate(amount: number): Promise<void>;
    getSweepAddress(): string;
}
