import { GethNode, GethNodeConfig } from './geth-node'
import { each as promiseEach } from 'promise-each2'

const childProcess = require('child_process')
const rimraf = require('rimraf')
const fs = require('fs')

export interface Keystore {
  address: string
  path: string
  jsonData: string
}

export const defaultKeystore = { 
  address: '0x0b7ffe7140d55b39f200557ef0f9ec1dd2e8f1ba',
  path: '/UTC--2017-08-01T22-03-26.486575100Z--0b7ffe7140d55b39f200557ef0f9ec1dd2e8f1ba',
  jsonData: '{"address":"0b7ffe7140d55b39f200557ef0f9ec1dd2e8f1ba","crypto":{"cipher":"aes-128-ctr","ciphertext":"4ce91950a0afbd17a8a171ce0cbac5e16b5c1a326d65d567e3f870324a36605f","cipherparams":{"iv":"1c765de19104d873b165e6043d006c11"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"d5c37ef44846f7fcef185c71e7f4c588a973fbbde13224a6f76ffa8924b7e0e0"},"mac":"b514587de559a69ce5080c8e6820fbc5a30495320d408be07b4f2253526265f7"},"id":"3d845d15-e801-4096-830b-84f8d5d50df9","version":3}'
}
export interface EthereumNetworkConfig {
  tempPath: string
  startingPort: number
  gethPath: string
  keystore?: Keystore
}

export class EthereumNetwork {
  private config: EthereumNetworkConfig
  private currentPort: number
  private coinbase: string
  public mainNode?: GethNode
  private nodes: GethNode []

  constructor(config: EthereumNetworkConfig) {
    this.config = config
    this.currentPort = config.startingPort || 8545
    this.coinbase = this.config.keystore ? this.config.keystore.address : defaultKeystore.address
    this.nodes = []
  }

  getCoinbase(): string {
    return this.coinbase
  }

  async createNode(): Promise<GethNode> {
    const node = new GethNode({
      index: this.nodes.length,
      tempPath: this.config.tempPath,
      gethPath: this.config.gethPath,
      coinbase: this.coinbase
    })
    const genesisPath = this.config.tempPath + '/genesis.json'
    node.initialize(genesisPath)
    await node.startMining()
    this.nodes.push(node)
    return node   
  }

  async createControlNode(): Promise<GethNode> {
    if (this.nodes.length > 0) {
      console.log('Control node already created')
      return Promise.resolve(this.nodes[0])
    }
    const node = await this.createNode()
    fs.writeFileSync(node.getKeydir() + this.coinbase.path, this.coinbase.jsonData)
    this.nodes.push(node)
    return node
  }

  resetTempDir(): void {
    console.log('Resetting temp eth directory')
    rimraf.sync(this.config.tempPath) // triple-check that this works!!!
    if (!fs.existsSync(this.config.tempPath)) {
      console.log('Creating new temp directory')
      fs.mkdirSync(this.config.tempPath)
      fs.mkdirSync(this.config.tempPath + '/keystore')
      fs.mkdirSync(this.config.tempPath + '/geth')
    } else {
      console.warn('Error rim-raffing temp eth directory')
    }
  }

  async initialize() {
    this.resetTempDir()
    const genesisPath = this.config.tempPath + '/genesis.json'
    this.createGenesisFile(genesisPath)
    const mainNode = await this.createControlNode()
    this.nodes.push(mainNode)
    return mainNode
  }

  stop() {
    return promiseEach(this.nodes, (node: GethNode) => node.stop())
  }

  private createGenesisFile(path: string) {
    const content = {
      'config': {
        'chainId': 15,
        'homesteadBlock': 0,
        'eip155Block': 0,
        'eip158Block': 0
      },
      'alloc': {
        [this.coinbase.address]: { 'balance': '111100113120000000000052' }
      },
      'coinbase': this.coinbase.address,
      'difficulty': '0x20000',
      'extraData': '',
      'gasLimit': '0x2fefd8',
      'nonce': '0x0000000000000042',// "0x" + Math.floor(Math.random() * 10000000000000000),
      'mixhash': '0x0000000000000000000000000000000000000000000000000000000000000000',
      'parentHash': '0x0000000000000000000000000000000000000000000000000000000000000000',
      'timestamp': '0x00'
    }

    const fs = require('fs')
    fs.writeFileSync(path, JSON.stringify(content), 'utf8')
  }
}

export function createNetwork(config: EthereumNetworkConfig): EthereumNetwork {
  const network = new EthereumNetwork(config)
  network.initialize()
  return network
}
