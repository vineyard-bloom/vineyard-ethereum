import { blockchain } from 'vineyard-blockchain';
import { Web3Client } from './client-functions';
import { Web3EthereumClientConfig } from './ethereum-client';
export declare class EthereumBlockReader implements blockchain.BlockReader<blockchain.FullBlock<blockchain.ContractTransaction>> {
    protected web3: Web3Client;
    constructor(web3: Web3Client);
    getHeighestBlockIndex(): Promise<number>;
    getBlockInfo(index: number): Promise<blockchain.Block | undefined>;
    getFullBlock(blockIndex: number): Promise<blockchain.FullBlock<blockchain.ContractTransaction> | undefined>;
    getBlockTransactions(blockIndex: number): Promise<blockchain.ContractTransaction[]>;
    static createFromConfig(config: Web3EthereumClientConfig): EthereumBlockReader;
}
