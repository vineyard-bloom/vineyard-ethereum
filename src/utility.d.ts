import { AddressManager, EthereumClient } from "./types";
export declare function ethToWei(amount: any): any;
export declare function weiToEth(amount: any): any;
export declare function checkAllBalances(web3: any): void;
export declare function getTransactions(client: EthereumClient, addressManager: AddressManager, i: number): Promise<any[]>;
export interface ValidationResult {
    receipt: any;
    isValid: boolean;
}
export declare function isTransactionValid(client: EthereumClient, txid: any): Promise<ValidationResult>;
export declare function getTransactionsFromRange(client: EthereumClient, addressManager: AddressManager, lastBlock: any, newLastBlock: any): Promise<any[]>;
export declare function getEvents(web3: any, filter: any): Promise<any>;
