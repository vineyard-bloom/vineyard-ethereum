import {Web3EthereumClient} from "../src"
const child_process = require('child_process')

enum Status {
  inactive,
  active
}

export class GethNode {
  private status: Status = Status.inactive
  private stdout
  private stderr
  private childProcess
  private port
  private client: Web3EthereumClient

  constructor(port = 8545) {
    this.port = port
    this.client = new Web3EthereumClient({
      http: "http://localhost:" + port
    })
  }

  getWeb3() {
    return this.client.getWeb3()
  }

  getClient() {
    return this.client
  }

  start(): Promise<void> {
    console.log('Starting Geth')
    const childProcess = this.childProcess = child_process.exec(
      'geth --dev  --verbosity 4 --rpc --rpcport ' + this.port + ' --rpcapi=\"db,eth,net,web3,personal,web3\" --keystore ./temp/keystores console'
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

    return new Promise<void>((resolve, reject) => {
      setTimeout(1000, resolve)
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