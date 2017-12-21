import BigNumber from 'bignumber.js';
import { AddressManager, EthereumClient } from "./types";
export declare function ethToWei(amount: BigNumber): BigNumber;
export declare function weiToEth(amount: BigNumber): BigNumber;
export declare function checkAllBalances(web3: any): void;
export declare function getTransactions(client: EthereumClient, addressManager: AddressManager, i: number): Promise<any[]>;
export declare function isTransactionValid(client: EthereumClient, txid: string): Promise<Boolean | void>;
export declare function getTransactionsFromRange(client: EthereumClient, addressManager: AddressManager, lastBlock: any, newLastBlock: any): Promise<any[]>;
