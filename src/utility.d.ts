import BigNumber from 'bignumber.js';
import { AddressManager, EthereumClient } from './types';
import { Web3Client } from './client-functions';
import { Web3EthereumClientConfig } from './ethereum-client';
export declare function ethToWei(amount: BigNumber): BigNumber;
export declare function weiToEth(amount: BigNumber): BigNumber;
export declare function checkAllBalances(web3: any): void;
export declare function getTransactions(client: EthereumClient, addressManager: AddressManager, i: number): Promise<any[]>;
export declare function isTransactionValid(client: EthereumClient, txid: string): Promise<Boolean | void>;
export declare function getTransactionsFromRange(client: EthereumClient, addressManager: AddressManager, lastBlock: any, newLastBlock: any): Promise<any[]>;
export declare function initializeWeb3(ethereumConfig: Web3EthereumClientConfig, web3?: Web3Client): any;
export interface ContractEvent {
    transactionHash: string;
    address: string;
}
export interface EventFilter {
    address?: string | string[];
    to?: string;
    from?: string;
    toBlock?: number;
    fromBlock?: number;
    topics?: any[];
}
export declare function getEvents(web3: any, filter: EventFilter): Promise<ContractEvent[]>;
