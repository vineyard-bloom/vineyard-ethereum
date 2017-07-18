
export interface EthLab {
  getSweepAddress(): string
  start():Promise<void>
  generate(address: string, amount:number):Promise<void>
}