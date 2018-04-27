import BigNumber from 'bignumber.js';
import { Block, EthereumTransaction, Web3Transaction, Web3TransactionReceipt } from './types';
import { BaseBlock, blockchain } from 'vineyard-blockchain';
import { ContractEvent, EventFilter } from './utility';
export declare type Resolve2<T> = (value: T) => void;
export declare type Web3Client = any;
export interface SendTransaction {
    from: string;
    to: string;
    value: BigNumber;
    gas?: number;
    gasPrice?: BigNumber;
}
export declare function unlockWeb3Account(web3: any, address: string): Promise<boolean>;
export declare function sendWeb3Transaction(web3: any, transaction: SendTransaction): Promise<EthereumTransaction>;
export declare function getBlock(web3: Web3Client, blockIndex: number): Promise<Block>;
export declare function getBlockIndex(web3: Web3Client): Promise<number>;
export declare function getLastBlock(web3: Web3Client): Promise<BaseBlock>;
export declare function getTransactionReceipt(web3: Web3Client, txid: string): Promise<Web3TransactionReceipt>;
export declare function getTransactionStatus(web3: Web3Client, txid: string): Promise<blockchain.TransactionStatus>;
export declare function getNextBlockInfo(web3: Web3Client, previousBlockIndex: number | undefined): Promise<BaseBlock | undefined>;
export declare function convertStatus(gethStatus: string): blockchain.TransactionStatus;
export declare const toChecksumAddress: any;
export declare function getNullableChecksumAddress(address?: string): string | undefined;
export declare function checkContractMethod(contract: any, methodName: string, args?: any[]): Promise<boolean>;
export declare function callContractMethod<T>(contract: any, methodName: string, args?: any[]): Promise<T>;
export declare function callCheckedContractMethod<T>(contract: any, methodName: string, args?: any[]): Promise<T | undefined>;
export declare function createContract(eth: any, abi: any, address: string): any;
export interface DeployContractArguments {
    data: string;
    from?: string;
    gas: number | BigNumber;
    gasPrice: number;
}
export declare function deployContract(web3: Web3Client, args: DeployContractArguments): Promise<string>;
export declare function getTokenContractFromReceipt(web3: Web3Client, receipt: Web3TransactionReceipt): Promise<blockchain.AnyContract | undefined>;
export declare function getBlockContractTransfers(web3: Web3Client, filter: EventFilter): Promise<blockchain.BaseEvent[]>;
export declare function decodeTokenTransfer(event: blockchain.BaseEvent): blockchain.DecodedEvent;
export declare function mapTransactionEvents(events: ContractEvent[], txid: string): ContractEvent[];
export declare function loadTransaction(web3: Web3Client, tx: Web3Transaction, block: Block, events: ContractEvent[]): Promise<{
    txid: string;
    to: string | undefined;
    from: string | undefined;
    amount: BigNumber;
    timeReceived: Date;
    status: blockchain.TransactionStatus;
    blockIndex: number;
    gasUsed: number;
    gasPrice: BigNumber;
    fee: BigNumber;
    newContract: blockchain.Contract | undefined;
    events: ContractEvent[];
    nonce: number;
}>;
export declare function partitionArray<T>(partitionSize: number, items: T[]): T[][];
export declare function partitionedMap<T, O>(partitionSize: number, action: (item: T) => Promise<O>, items: T[]): Promise<O[]>;
export declare function getFullBlock(web3: Web3Client, blockIndex: number): Promise<blockchain.FullBlock<blockchain.ContractTransaction>>;
