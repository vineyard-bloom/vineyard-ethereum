import { GenericEthereumManager } from './ethereum-transaction-monitor';
import { EthereumTransaction } from './types';
export interface EthereumSweepConfig {
    minSweepAmount: number;
    sweepAddress: string;
}
export interface Bristle {
    from: string;
    to: string;
    account: string;
    status: number;
    txid: string;
    blockIndex: number;
    amount: number;
}
export declare class Broom {
    private minSweepAmount;
    private sweepGas;
    private sweepAddress;
    private manager;
    private client;
    constructor(ethereumConfig: EthereumSweepConfig, ethereumManager: GenericEthereumManager<EthereumTransaction>, ethereumClient: any);
    getSweepGas(): any;
    calculateSendAmount(amount: any): number;
    saveSweepRecord(txHash: any): any;
    singleSweep(address: any): Promise<Bristle>;
    sweep(): any;
}
