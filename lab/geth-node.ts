import {Web3EthereumClient} from "../src"
const child_process = require('child_process')
const rimraf = require('rimraf')

enum Status {
  inactive,
  active
}

export interface GethNodeConfig {
  gethPath?: string
}

// export class Miner {
//   private minerProcess
//   constructor() {

//   }

//   start(): Promise<void> {
//     return new Promise<void>((resolve, reject) => {
//      const minerProcess = this.minerProcess = child_process.exec(
//       gethPath + ' --dev --verbosity 4 --keystore ./temp/keystore'
//       + ' --datadir ' + datadir + ' --networkid 101 --mine --minerthreads 5 console'
//     ) 
//     })
//   }
// }

export class GethNode {
  private status: Status = Status.inactive
  private stdout
  private stderr
  private childProcess
  // private miner: Miner
  private client: Web3EthereumClient
  private config: GethNodeConfig
  private static instanceIndex: number = 0
  private datadir: string

  constructor(config?: GethNodeConfig) {
    this.config = config || {}
    // this.miner = new Miner()
    this.datadir = './temp/eth/geth' + GethNode.instanceIndex++
  }

  getWeb3() {
    return this.client.getWeb3()
  }

  getClient() {
    return this.client
  }

  startMiner(port) {
    return this.start(port, '--mine --minerthreads 5 --verbosity 4')
  }

  start(port, flags = ''): Promise<void> {
    const gethPath = this.config.gethPath || 'geth'
    console.log('Starting Geth')
    const childProcess = this.childProcess = child_process.exec(
      gethPath + ' --dev --rpc --rpcport ' + port
      + ' --rpcapi=\"db,eth,net,web3,personal,miner,web3\" --keystore ./temp/eth/keystore'
      + ' --datadir ' + this.datadir + ' --networkid 101 ' + flags + ' console'
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

    return new Promise<void>(resolve => setTimeout(resolve, 1000))
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

  static initialize() {
    return new Promise((resolve, reject) => {
      rimraf('./temp/eth', function (error, stdout, stderr) {
        if (error)
          reject(error)

        else
          resolve(stdout)
      })
    })
  }
}

export function mine(node, port, milliseconds: number) {
  console.log('Mining for ' + milliseconds + ' milliseconds.')
  return node.startMiner(port)
    .then(() => new Promise<void>(resolve => setTimeout(resolve, milliseconds)))
    .then(() => node.stop())
    .then(() => console.log('Finished mining.'))
}