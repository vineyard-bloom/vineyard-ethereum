
export interface EthLab {

  start():Promise<void>
  generate(amount:number):Promise<void>
}