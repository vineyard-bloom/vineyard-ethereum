/*
export class PretendEthLab {
  client: MockEthereumClient

  constructor(client: MockEthereumClient) {
    this.client = client
    client.importAddress('')
  }
  start(): Promise<void
> {
    return Promise.resolve()
  }

  stop(): Promise<any> {
    return Promise.resolve()
  }

  reset(): Promise<any> {
    // return this.deleteWallet()
    return this.start()
    // .then(() => this.deleteWallet())
    // .then(() => this.start())
  }

  send(address: string, amount:any): Promise<EthereumTransaction> {
    return this.client.send('', address, amount)
  }

  getSweepAddress(): string {
    return ""
  }

  generate(blockCount: number): Promise<any> {
    return this.client.generate(blockCount)
  }
}*/
