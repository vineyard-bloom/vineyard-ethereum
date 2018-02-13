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
    tokenContractAddress: string;
    hotWallet: string;
}
export declare function gweiToWei(amount: any): any;
export declare class Broom {
    private manager;
    private client;
    private config;
    private tokenContract;
    private gasTotal;
    constructor(config: SweepConfig, ethereumManager: SweepManager, ethereumClient: any);
    getTotalGas(): any;
    saveSweepRecord(bristle: Bristle): Promise<any>;
    sweep(): Promise<void>;
    tokenSweep(abi: any): Promise<void>;
    tokenSingleSweep(abi: any, address: string): Promise<any>;
    needsGas(abi: any, address: string): Promise<boolean>;
    gasTransaction(abi: any, address: any): Promise<any>;
    provideGas(abi: any): Promise<void>;
    private singleSweep(address);
}
