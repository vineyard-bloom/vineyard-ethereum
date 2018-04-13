import { BaseBlock, blockchain, BlockInfo, ReadClient } from 'vineyard-blockchain';
import { Web3EthereumClientConfig } from './ethereum-client';
import { Block, EthereumTransaction, Web3TransactionReceipt } from './types';
import { SendTransaction, Web3Client } from './client-functions';
export interface AbiObject {
    name: string;
    type: string;
    inputs: AbiObject[];
}
export declare class TokenClient implements ReadClient<blockchain.ContractTransaction> {
    private web3;
    private tokenContractAddress;
    private currency;
    private methodIDs;
    private abi;
    constructor(ethereumConfig: Web3EthereumClientConfig, currency: number, tokenContractAddress: string, abi: object, web3?: Web3Client);
    send(transaction: SendTransaction): Promise<EthereumTransaction>;
    getBlockIndex(): Promise<number>;
    getLastBlock(): Promise<BaseBlock>;
    getTransactionStatus(txid: string): Promise<blockchain.TransactionStatus>;
    getNextBlockInfo(previousBlock: BlockInfo | undefined): Promise<BaseBlock | undefined>;
    getFullBlock(blockInfo: BlockInfo): Promise<blockchain.FullBlock<blockchain.ContractTransaction>>;
    getBlock(blockIndex: number): Promise<Block>;
    getTransactionReceipt(txid: string): Promise<Web3TransactionReceipt>;
    addAbi(abiArray: any): any[];
}
