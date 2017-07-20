import {EthereumTransaction} from "../src"

export interface EthLab {
  getSweepAddress(): string;
  start(): Promise<void>;
  send(address: string, amount: string): Promise<EthereumTransaction>;
  reset(): Promise<any>;
}
