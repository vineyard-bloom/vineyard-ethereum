import { SweepManager } from './types';
export interface Bristle {
    from: string;
    to: string;
    status: number;
    txid: string;
    amount: any;
}
export interface SweepConfig {
    sweepAddress: string;
    minSweepAmount: any;
    gas: any;
    gasPrice: any;
}
export declare function gweiToWei(amount: any): any;
export declare class Broom {
    private manager;
    private client;
    private config;
    constructor(config: SweepConfig, ethereumManager: SweepManager, ethereumClient: any);
    private singleSweep(address);
    calculateSendAmount(amount: any): any;
    saveSweepRecord(bristle: Bristle): Promise<any>;
    sweep(): Promise<void>;
}
