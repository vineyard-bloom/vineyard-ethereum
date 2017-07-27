import { GenericEthereumManager, EthereumTransaction } from './types';
export interface Bristle {
    from: string;
    to: string;
    status: number;
    txid: string;
    amount: number;
}
export declare class Broom {
    private minSweepAmount;
    private sweepGas;
    private sweepAddress;
    private manager;
    private client;
    constructor(minSweepAmount: any, ethereumManager: GenericEthereumManager<EthereumTransaction>, ethereumClient: any);
    private getSweepGas();
    private singleSweep(address);
    calculateSendAmount(amount: number): Promise<number>;
    saveSweepRecord(bristle: Bristle): Promise<any>;
    sweep(): Promise<any>;
}
