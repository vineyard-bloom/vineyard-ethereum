import { blockchain } from 'vineyard-blockchain';
import { Web3Client } from './client-functions';
export declare class EthereumReadClient implements blockchain.ReadClient<blockchain.SingleTransaction> {
    private web3;
    constructor(web3: Web3Client);
    getBlockIndex(): Promise<number>;
    getLastBlock(): Promise<blockchain.Block>;
    getTransactionStatus(txid: string): Promise<blockchain.TransactionStatus>;
    getNextBlockInfo(block: blockchain.Block | undefined): Promise<blockchain.Block | undefined>;
    getBlockTransactions(block: blockchain.Block): Promise<blockchain.SingleTransaction[]>;
}
