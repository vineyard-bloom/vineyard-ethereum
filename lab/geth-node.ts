import {Web3EthereumClient} from "../src"
const child_process = require('child_process')
const rimraf = require('rimraf')

enum Status {
  inactive,
  active
}

export interface GethNodeConfig {
  gethPath?: string
  verbosity?: number // 0 - 6
  tempPath?: string
  port?: number
  index?: number
  bootnodes?: string
}

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
    this.config.gethPath = this.config.gethPath || 'geth'
  }

  getWeb3() {
    return this.client.getWeb3()
  }

  getClient() {
    return this.client
  }

  startMining() {
    console.log('*** mining')
    return this.start('--mine --minerthreads 8 --etherbase=0x0000000000000000000000000000000000000000')
  }

  private launch(flags) {
    // const splitFlags = flags.trim().split(/\s+/)
    // this.childProcess = child_process.execFile(this.config.gethPath, splitFlags, (error, stdout, stderr) => {
    //   if (error)
    //     throw error
    //
    //   if (stdout)
    //     console.log(this.index, stdout)
    //
    //   if (stderr)
    //     console.error(this.index, error)
    // })
    const childProcess = this.childProcess = child_process.exec(this.config.gethPath + flags)
    childProcess.stdout.on('data', (data) => {
      console.log(this.index, 'stdout:', `${data}`);
    });

    childProcess.stderr.on('data', (data) => {
      console.error(this.index, 'stderr:', `${data}`);
    });

    this.childProcess.on('close', (code) => {
      console.log(this.index, `child process exited with code ${code}`);
    })

    this.client = new Web3EthereumClient({
      http: "http://localhost:" + this.port
    })

    return new Promise<void>(resolve => setTimeout(resolve, 1000))
  }

  getBootNodeFlags() {
    return this.config.bootnodes
      ? ' --bootnodes ' + this.config.bootnodes + ' '
      : ''
  }

  getCommonFlags() {
    const verbosity = this.config.verbosity || 0

    return ' --ipcdisable --keystore ' + this.keydir
      + ' --datadir ' + this.datadir
      + ' --verbosity ' + verbosity
      + ' --networkid 101 --port=' + (30303 + this.index)
  }

  // getMainCommand(): string {
  //   return this.config.gethPath + this.getCommonFlags()
  // }

  getRPCFlags() {
    return ' --rpc --rpcport ' + this.port
      + ' --rpcapi=\"db,eth,net,web3,personal,miner,web3\" '
  }

  start(flags = ''): Promise<void> {
    console.log('Starting Geth')
    const command = this.getCommonFlags() + this.getRPCFlags() + this.getBootNodeFlags() + flags + ' console'
    console.log('geth ' + command)
    return this.launch(command)
  }

  execSync(suffix: string) {
    const command = this.config.gethPath + this.getCommonFlags() + ' ' + suffix
    console.log(command)
    const result = child_process.execSync(command)
    return result.toString()
  }

  initialize(genesisPath: string): Promise<void> {
    return this.execSync('init ' + genesisPath)
  }

  getNodeUrl(): string {
    return this.execSync('--exec admin.nodeInfo.enode console')
      .replace(/\r\n/g, '')
      .replace('[::]', '127.0.0.1')
  }

  isRunning() {
    return this.childProcess != null
  }

  isConnected() {
    return this.client.getWeb3().isConnected()
  }

  stop() {
    if (!this.childProcess)
      return Promise.resolve()

    console.log(this.index, 'Stopping node.')
    this.client.getWeb3().reset()

    return new Promise((resolve, reject) => {
      this.childProcess.stdin.write("exit\n")
      this.childProcess.kill()
      this.childProcess.on('close', (code) => {
        this.childProcess = null
        console.log(this.index, 'Node stopped.')
        resolve()
      })
    })
  }

  mine(milliseconds: number) {
    console.log('Mining for ' + milliseconds + ' milliseconds.')
    let previousBlockNumber
    return this.startMining()
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
