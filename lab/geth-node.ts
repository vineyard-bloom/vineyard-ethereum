import {Web3EthereumClient} from "../src"
const child_process = require('child_process')

enum Status {
  inactive,
  active
}

export interface GethNodeConfig {
  gethPath?: string
}

export class GethNode {
  private status: Status = Status.inactive
  private stdout
  private stderr
  private childProcess
  private client: Web3EthereumClient
  private config: GethNodeConfig

  constructor(config?: GethNodeConfig) {
    this.config = config || {}
  }

  getWeb3() {
    return this.client.getWeb3()
  }

  getClient() {
    return this.client
  }

  start(port): Promise<void> {
    console.log('Starting Geth')
    const gethPath = this.config.gethPath || 'geth'
    const childProcess = this.childProcess = child_process.exec(
      gethPath + ' --dev  --verbosity 4 --rpc --rpcport ' + port + ' --rpcapi=\"db,eth,net,web3,personal,web3\" --keystore ./temp/keystore console'
    )

    childProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    childProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    })

    this.client = new Web3EthereumClient({
      http: "http://localhost:" + port
    })

    return new Promise<void>((resolve, reject) => {
      setTimeout(resolve, 1000)
    })
  }

  stop() {
    if (!this.childProcess)
      return Promise.resolve()

    return new Promise((resolve, reject) => {
      this.childProcess.kill()
      this.childProcess.on('close', (code) => {
        resolve()
      })
    })

  }
}