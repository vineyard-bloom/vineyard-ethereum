import { AddressManager, EthereumClient } from "./types";
export declare function ethToWei(amount: any): any;
export declare function weiToEth(amount: any): any;
export declare function checkAllBalances(eth: any, web3: any): void;
export declare function getTransactionsFromRange(client: EthereumClient, addressManager: AddressManager, lastBlock: any): Promise<any[]>;
