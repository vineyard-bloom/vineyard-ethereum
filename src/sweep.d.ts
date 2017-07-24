import { GenericEthereumManager } from './ethereum-transaction-monitor';
import { EthereumTransaction } from './types';
export interface EthereumSweepConfig {
    minSweepAmount: number;
    sweepAddress: string;
}
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
    constructor(ethereumConfig: EthereumSweepConfig, ethereumManager: GenericEthereumManager<EthereumTransaction>, ethereumClient: any);
    private getSweepGas();
    private singleSweep(address);
    calculateSendAmount(amount: any): number;
    saveSweepRecord(bristle: Bristle): any;
    sweep(): Promise<any>;
}
