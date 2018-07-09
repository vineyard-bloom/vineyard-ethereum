import { blockchain } from 'vineyard-blockchain';
import { Web3Client } from './client-functions';
import { Web3EthereumClientConfig } from './ethereum-client';
export declare class EthereumBlockReader implements blockchain.BlockReader<blockchain.EthereumBlock, blockchain.ContractTransaction> {
    protected web3: Web3Client;
    constructor(web3: Web3Client);
    getHeighestBlockIndex(): Promise<number>;
    getBlockInfo(index: number): Promise<blockchain.Block | undefined>;
    getBlockBundle(blockIndex: number): Promise<blockchain.BlockBundle<blockchain.EthereumBlock, blockchain.ContractTransaction>>;
    getBlockTransactions(blockIndex: number): Promise<blockchain.ContractTransaction[]>;
    static createFromConfig(config: Web3EthereumClientConfig): EthereumBlockReader;
}
