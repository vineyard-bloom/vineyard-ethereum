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

  getSweepAddress(): string {
    return this.config.ethereum.sweepAddress
  }

  start(): Promise<void> {
    return this.server.start()
  }

  stop(): Promise<any> {
    return this.server.stop()
  }

  reset(): Promise<any> {
    // return this.deleteWallet()
    return this.stop()
    // .then(() => this.deleteWallet())
    .then(() => this.start())
  }

  send(address: string, amount: number) {
    return new Promise<void>((resolve, reject) => {
      this.client.getClient().send('', address, amount)
        .then(result => console.log(result))
        .catch(error => console.log(error))
    })
  }
}