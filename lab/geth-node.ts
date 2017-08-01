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
  private stdout
  private stderr
  private childProcess = null
  private client: Web3EthereumClient
  private config: GethNodeConfig
  private static instanceIndex: number = 0
  private datadir: string
  private keydir: string
  private port
  private index

  constructor(config?: GethNodeConfig, port?) {
    this.config = config || {}
    this.index = GethNode.instanceIndex++
    this.datadir = './temp/eth/geth' + this.index
    this.keydir = './temp/eth/keystore' + this.index
    this.port = port
  }

  getWeb3() {
    return this.client.getWeb3()
  }

  getClient() {
    return this.client
  }

  startMining() {
    console.log('*** mining')
    return this.start('--mine --minerthreads 8')
  }

  start(flags = ''): Promise<void> {
    const gethPath = this.config.gethPath || 'geth'
    console.log('Starting Geth')
    const command = gethPath + ' --dev --rpc --verbosity 5 --rpcport ' + this.port
      + ' --rpcapi=\"db,eth,net,web3,personal,miner,web3\" --keystore ' + this.keydir
      + ' --datadir ' + this.datadir + ' --networkid 101 ' + flags + ' console'
    console.log(command)
    const childProcess = this.childProcess = child_process.exec(command)

    childProcess.stdout.on('data', (data) => {
      console.log(this.index, 'stdout:', `${data}`);
    });

    childProcess.stderr.on('data', (data) => {
      console.error(this.index, 'stderr:', `${data}`);
    });

    childProcess.on('close', (code) => {
      console.log(this.index, `child process exited with code ${code}`);
    })

    this.client = new Web3EthereumClient({
      http: "http://localhost:" + this.port
    })

    return new Promise<void>(resolve => setTimeout(resolve, 1000))
  }

  isRunning() {
    return this.childProcess != null
  }

  stop() {
    console.log(this.index, 'Stopping node.')
    if (!this.childProcess)
      return Promise.resolve()

    return new Promise((resolve, reject) => {
      this.childProcess.kill()
      this.childProcess.on('close', (code) => {
        this.childProcess = null
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

  mine(milliseconds: number) {
    console.log('Mining for ' + milliseconds + ' milliseconds.')
    let previousBlockNumber
    return this.startMiner()
      .then(() => this.getClient().getBlockNumber())
      .then(blockNumber => previousBlockNumber = blockNumber)
      .then(() => new Promise<void>(resolve => setTimeout(resolve, milliseconds)))
      .then(() => this.getClient().getBlockNumber())
      .then(blockNumber => console.log('Mined ' + (blockNumber - previousBlockNumber) + " blocks."))
      .then(() => this.stop())
  }
}

// export function mine(node, milliseconds: number) {
//   console.log('Mining for ' + milliseconds + ' milliseconds.')
//   let previousBlockNumber
//   const wasRunning = node.isRunning()
//   return node.stop()
//     .then(() => node.startMiner())
//     .then(() => node.getClient().getBlockNumber())
//     .then(blockNumber => previousBlockNumber = blockNumber)
//     .then(() => new Promise<void>(resolve => setTimeout(resolve, milliseconds)))
//     .then(() => node.getClient().getBlockNumber())
//     .then(blockNumber => console.log('Mined ' + (blockNumber - previousBlockNumber) + " blocks."))
//     .then(() => node.stop())
//     .then(() => {
//       if (wasRunning) {
//         return node.start(port)
//       }
//     })
// }
