import {GethServer} from "./gethServer"
import {EthereumClient} from "vineyard-ethereum"
import {EthLab} from "./eth-lab";
const child_process = require('child_process')
const fs = require('fs')

export interface GethLabConfig {
  address: string
}

export class GethLab implements EthLab {
  server: GethServer
  client: EthereumClient
  config: GethLabConfig
  defaultAddress: string = ""

  constructor(config: GethLabConfig, client: EthereumClient, server: GethServer = new GethServer()) {
    this.config = config
    this.client = client
    this.server = server
  }

  start(): Promise<void> {
    return this.server.start()
  }

  stop(): Promise<any> {
    return this.server.stop()
  }

  reset(): Promise<any> {
    return this.deleteWallet()
    // return this.stop()
    // .then(() => this.deleteWallet())
    // .then(() => this.start())
  }

  generate(blockCount: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.getClient().generate(blockCount, (error) => {
        if (error)
          reject(new Error(error));
        else
          resolve()
      })
    })
  }

  send(address: string, amount: number) {
    return new Promise<void>((resolve, reject) => {
      this.client.getClient().send(defaultAddress, address, amount)
        .then(result => console.log(result))
        .catch(error => console.log(error))
    })
  }
}