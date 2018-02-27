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
    tokenSweepAddress: string;
    enabled: boolean;
    minSweepAmount: string;
    gas: number;
    gasPrice: string;
    hotWallet: string;
    tokenContractAddress: string;
    testTokenContractAddress: string;
}
export declare function gweiToWei(amount: any): any;
export declare class Broom {
    private manager;
    private client;
    private config;
    private tokenContract;
    constructor(config: SweepConfig, ethereumManager: SweepManager, ethereumClient: any);
    private singleSweep(address);
    private sweepSendAndSave(balance, address);
    calculateSendAmount(amount: any): any;
    saveSweepRecord(bristle: Bristle): Promise<any>;
    sweep(): Promise<void>;
    tokenSweep(abi: any): any;
    tokenSingleSweep(abi: any, address: any): any;
    needsGas(abi: any, address: any): Promise<boolean>;
    gasTransaction(abi: any, address: any): Promise<any>;
    provideGas(abi: any): any;
}
