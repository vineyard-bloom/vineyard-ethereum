import { blockchain } from 'vineyard-blockchain';
import { Web3Client } from './client-functions';
export declare class EthereumBlockClient implements blockchain.BlockClient<blockchain.SingleTransaction> {
    private web3;
    constructor(web3: Web3Client);
    getBlockIndex(): Promise<number>;
    getBlockInfo(index: number): Promise<blockchain.Block | undefined>;
    getBlockTransactions(block: blockchain.Block): Promise<blockchain.SingleTransaction[]>;
}
