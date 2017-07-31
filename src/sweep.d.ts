import { SweepManager } from './types';
export interface Bristle {
    from: string;
    to: string;
    status: number;
    txid: string;
    amount: number;
}
export interface SweepConfig {
    sweepAddress: string;
    minSweepAmount: number;
    gas: any;
}
export declare class Broom {
    private manager;
    private client;
    private minSweepAmount;
    private gas;
    constructor(minSweepAmount: any, ethereumManager: SweepManager, ethereumClient: any);
    private getSweepGas();
    private singleSweep(address);
    calculateSendAmount(amount: number): Promise<number>;
    saveSweepRecord(bristle: Bristle): Promise<any>;
    sweep(): Promise<void>;
}
