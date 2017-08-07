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
  coinbase: string
  enodes?: string[]
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

  getKeydir() {
    return this.keydir
  }

  startMining() {
    console.log('*** mining')
    return this.start('--mine --minerthreads=4 --etherbase=' + this.config.coinbase)
  }

  private launch(flags) {
    const childProcess = this.childProcess = child_process.exec(this.config.gethPath + flags)
    childProcess.stdout.on('data', (data) => {
      console.log(this.index, 'stdout:', `${data}`);
    })

    childProcess.stderr.on('data', (data) => {
      console.error(this.index, 'stderr:', `${data}`);
    })

    this.childProcess.on('close', (code) => {
      console.log(this.index, `child process exited with code ${code}`);
    })

    this.client = new Web3EthereumClient({
      http: "http://localhost:" + this.port
    })

    return new Promise<void>(resolve => {
      let is_finished = false
      const finished = () => {
        if (!is_finished) {
          is_finished = true
          console.log(this.index, 'Connected to web3')
          resolve()
        }
      }
      setTimeout(finished, 5500)
      const next = () => {
        return new Promise<void>(resolve => setTimeout(resolve, 50))
          .then(() => {
            if (is_finished)
              return

            if (!this.isConnected())
              return next()

            finished()
          })
      }

      next()
    })
      .then(() => {
        for (let i = 0; i < this.config.enodes.length; ++i) {
          this.addPeer(this.config.enodes[i])
        }
      })
  }

  getBootNodeFlags() {
    return ''
    // return this.config.bootnodes
    //   ? ' --bootnodes ' + this.config.bootnodes + ' '
    //   : ''
  }

  getCommonFlags() {
    const verbosity = this.config.verbosity || 0

    return ' --ipcdisable --nodiscover --keystore ' + this.keydir
      + ' --datadir ' + this.datadir
      + ' --verbosity ' + verbosity
      + ' --networkid 101 --port=' + (30303 + this.index)
  }

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
      .replace(/\r|\n/g, '')
      .replace('[::]', '127.0.0.1')
  }

  isRunning() {
    return this.childProcess != null
  }

  isConnected() {
    return this.client.getWeb3().isConnected()
  }

  mineBlocks(blockCount: number) {
    console.log('Mining', blockCount, 'blocks.')
    let originalBlock, targetBlock

    const next = () => {
      return new Promise<void>(resolve => setTimeout(resolve, 100))
        .then(() => this.getClient().getBlockNumber())
        .then(blockNumber => {
          if (blockNumber < targetBlock)
            return next()

          console.log('Mined ' + (blockNumber - originalBlock) + " blocks.")
        })
    }

    return this.getClient().getBlockNumber()
      .then(blockNumber => {
        originalBlock = blockNumber
        targetBlock = blockNumber + blockCount
      })
      .then(next)
  }

  addPeer(enode: string) {
    console.log(this.index, "admin.addPeer(" + enode + ")")
    this.childProcess.stdin.write("admin.addPeer(" + enode + ")\n")
  }

  listPeers() {
    this.childProcess.stdin.write("admin.peers\n")
  }

  stop() {
    if (!this.childProcess)
      return Promise.resolve()

    console.log(this.index, 'Stopping node.')
    this.client.getWeb3().reset()

    return new Promise((resolve, reject) => {
      this.childProcess.stdin.write("exit\n")
      this.childProcess.kill()
      const onStop = () => {
        if (this.childProcess) {
          this.childProcess = null
          console.log(this.index, 'Node stopped.')
          resolve()
        }
      }

      this.childProcess.on('close', (code) => {
        onStop()
      })

      setTimeout(() => {
        onStop()
      }, 500)
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
