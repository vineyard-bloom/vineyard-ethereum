import BigNumber from 'bignumber.js';
export declare type Resolve2<T> = (value: T) => void;
export declare type Web3Client = any;
export interface SendTransaction {
    from: string;
    to: string;
    value: BigNumber;
    gas?: number;
    gasPrice?: BigNumber;
}
export declare const toChecksumAddress: any;
export interface DeployContractArguments {
    data: string;
    from?: string;
    gas: number | BigNumber;
    gasPrice: number;
}
export interface VmOperation {
    op: string;
    stack: string[];
}
export interface VmTrace {
    structLogs: VmOperation[];
}
export interface InternalTransfer {
    gas: BigNumber;
    address: string;
    value: BigNumber;
}
export declare type Resolve2<T> = (value: T) => void;
export declare type Web3Client = any;
export interface SendTransaction {
    from: string;
    to: string;
    value: BigNumber;
    gas?: number;
    gasPrice?: BigNumber;
}
export declare const toChecksumAddress: any;
export interface DeployContractArguments {
    data: string;
    from?: string;
    gas: number | BigNumber;
    gasPrice: number;
}
export interface VmOperation {
    op: string;
    stack: string[];
}
export interface VmTrace {
    structLogs: VmOperation[];
}
export interface InternalTransfer {
    gas: BigNumber;
    address: string;
    value: BigNumber;
}
export declare function getParentBlockHash(model: any, parentBlock: any): Promise<string>;
export declare function validateBlock(model: any, blockNumber: number): Promise<any>;
