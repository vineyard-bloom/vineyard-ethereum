import { Web3EthereumClient } from '../src'

const axios = require('axios')

const ChildProcess = require('child_process')
const rimraf = require('rimraf')

enum Status {
  inactive,
  active
}

export interface GethNodeConfig {
  verbosity?: number // 0 - 6
  tempPath?: string
  index: number
  coinbase?: string
}

export class GethNode {
  private static instanceIndex: number = 0
  private childProcess: any
  private client: Web3EthereumClient
  private config: GethNodeConfig
  private datadir: string
  private keydir: string
  private gethPath: string
  private rpcPort: number
  private isMiner = false
  private rpcRequestId = 1 // Probably not needed but just in case.

  constructor(config: GethNodeConfig) {
    config.verbosity = config.verbosity || 1
    this.config = config
    const tempPath = this.config.tempPath || '.'
    this.datadir = tempPath + '/geth/' + config.index
    this.keydir = tempPath + '/keystore/' + config.index
    this.gethPath = this.datadir
    this.rpcPort = 8545 + config.index
    this.client = new Web3EthereumClient({ http: `http://localhost:${this.rpcPort}` })
  }

  getWeb3() {
    return this.client!.getWeb3()
  }

  getClient() {
    return this.client!
  }

  getKeydir() {
    return this.keydir
  }

  getCommonFlags() {
    return ' --nodiscover --keystore ' + this.keydir
      + ' --datadir ' + this.datadir
      + ' --networkid 101 --port=' + (30303 + this.index)
      + ' ' + this.getEtherbaseFlags()
      + ' --ipcdisable'
  }

  getRPCFlags() {
    return ' --rpc --rpcport ' + this.rpcPort
      + ' --rpcapi=\"db,eth,net,personal,debug,miner,admin,web3\" '
  }

  getEtherbaseFlags() {
    return '--etherbase=' + this.config.coinbase
  }

  start(flags = ''): Promise<void> {
    console.log('Starting Geth')
    const command = this.getCommonFlags()
      + ' --verbosity ' + 4
      + this.getRPCFlags()
      + flags + ' console'

    console.log('geth ' + command)
    return this.launch(command)
  }

  startMining() {
    this.isMiner = true
    return this.start('--mine --minerthreads=4 --dev.period=0')
  }

  execSync(suffix: string) {
    const command = this.gethPath
      + this.getCommonFlags()
      + ' --verbosity ' + this.config.verbosity 
      + ' ' + suffix
    console.log(command)
    const result = ChildProcess.execSync(command)
    return result.toString()
  }

  initialize(genesisPath: string) {
    this.execSync('init ' + genesisPath)
  }

  async invoke(method: string, params: any[] = []): Promise<any> {
    const body = {
      jsonrpc: '2.0',
      method: method,
      id: this.rpcRequestId++,
      params: params,
    }

    const response = await axios.post('http://localhost:' + this.rpcPort, body)
    const result = response.data.result

    return result
  }

  async getNodeUrl(): Promise<string> {
    const nodeInfo = await this.invoke('admin_nodeInfo')
    return nodeInfo.enode
  }

  isRunning() {
    return this.childProcess != null
  }

  isConnected() {
    return this.client!.getWeb3().isConnected()
  }

  async mineBlocks(blockCount: number, timeout: number = 10000) {
    console.log('Mining', blockCount, 'blocks')
    const originalBlock = await this.getClient().getBlockNumber()
    const targetBlock = originalBlock + blockCount
    const pauseDuration = 50

    const next = async (duration: number): Promise<any> => {
      await new Promise<void>(resolve => setTimeout(resolve, pauseDuration))
      const blockNumber = await this.getClient().getBlockNumber()
      if (blockNumber < targetBlock) {
        if (duration >= timeout) {
          throw new Error('Block mining exceeded timeout of ' + timeout + ' milliseconds. '
            + (blockNumber - originalBlock) + ' blocks were mined.'
          )
        }
        else {
          return next(duration + pauseDuration)
        }
      }

      console.log('Mined ' + (blockNumber - originalBlock) + ' blocks')
    }

    return next(0)
  }

  addPeer(enode: string): Promise<void> {
    return this.invoke('admin_addPeer', [enode])
  }

  listPeers() {
    this.childProcess.stdin.write('admin.peers\n')
  }

  stop() {
    if (!this.childProcess) {
      return Promise.resolve()
    }

    console.log(this.index, 'Stopping node.')
    this.client!.getWeb3().reset()

    return new Promise((resolve, reject) => {
      this.childProcess.stdin.write('exit\n')
      this.childProcess.kill()
      const onStop = () => {
        if (this.childProcess) {
          this.childProcess = null
          console.log(this.index, 'Node stopped.')
          resolve()
        }
      }

      this.childProcess.on('close', (code: any) => {
        onStop()
      })

      setTimeout(() => {
        onStop()
      }, 500)
    })
  }

  private launch(flags: any): Promise<void> {
    this.childProcess = ChildProcess.exec(this.config.gethPath + flags)
    this.childProcess.stdout.on('data', (data: any) => {
      if (this.config.verbosity)
        console.log(this.index, 'stdout:', `${data}`)
    })

    this.childProcess.stderr.on('data', (data: any) => {
      handlePossibleErrorMessage(this.index, data, this.config.verbosity)
    })

    this.childProcess.on('close', (code: any) => {
      console.log(this.index, `child process exited with code ${code}`)
    })

    return new Promise<void>(resolve => {
      let isFinished = false
      const finished = () => {
        if (!isFinished) {
          isFinished = true
          console.log(this.index, 'Connected to web3', ' (is connected):', this.isConnected())
          resolve()
        }
      }
      setTimeout(finished, 5500)
      const next = (): any => {
        return new Promise<void>(resolve => setTimeout(resolve, 50))
          .then(() => {
            if (isFinished) {
              return
            }

            if (!this.isConnected()) {
              return next()
            }

            finished()
          })
      }

      next()
    })
      .then(() => {
        const enodes = this.config.enodes || []
        for (let i = 0; i < enodes.length; ++i) {
          this.addPeer(enodes[i])
        }
      })
  }
}

const errorMessagePattern = /err="(.*?)"/

function preparePossibleErrorMessage(message: string) {
  // Currently Geth is outputting non-error messages to stderr.  (Which makes perfect sense in Geth-logic.)
  if (message.substring(0, 4) == 'INFO') {
    return { message, verbosity: 2 }
  }
  else if (message.substring(0, 5) == 'DEBUG') {
    const match = message.match(errorMessagePattern)
    if (match) {
      const message = match[1]
      return { message, verbosity: 1 }
    }
    else {
      return { message, verbosity: 2 }
    }
  }
  else {
    return { message, verbosity: 2 }
  }
}

function handlePossibleErrorMessage(index: number, message: string, verbosity: number = 0) {
  // This may always be a string but just in case...
  if (typeof message !== 'string')
    return

  const info = preparePossibleErrorMessage(message)
  if (info.verbosity >= verbosity) {
    // console.error(message)
  }
}