
export interface EthLab {
  getSweepAddress(): string
  start():Promise<void>
  generate(amount:number):Promise<void>
}