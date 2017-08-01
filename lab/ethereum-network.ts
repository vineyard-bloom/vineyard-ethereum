import {GethNode, GethNodeConfig} from "./geth-node";
const child_process = require('child_process')
const rimraf = require('rimraf')
import {each as promiseEach} from 'promise-each2'

export class EthereumNetwork {
  private config: GethNodeConfig
  private nextPort = 8546
  private mainNode: GethNode
  private coinbase: string = "0x0000000000000000000000000000000000000001"
  private enode: string = null
  private nodes: GethNode [] = []

  constructor(config: GethNodeConfig) {
    this.config = config
    this.config.tempPath = './temp/eth'
  }

  createNode() {
    const config = Object.assign({
      bootnodes: this.enode,
    }, this.config)
    const node = new GethNode(config, this.nextPort++)
    const GenesisPath = config.tempPath + '/genesis.json'
    node.initialize(GenesisPath)
    this.nodes.push(node)
    return node
  }

  getMainNode() {
    return this.mainNode
  }

  private createGenesisFile(path: string) {
    const content = {
      "config": {
        "chainId": 15,
        "homesteadBlock": 0,
        "eip155Block": 0,
        "eip158Block": 0
      },
      "alloc": {
        "0x0000000000000000000000000000000000000001": {"balance": "1111001131200"}
      },
      "coinbase": this.coinbase,
      "difficulty": "0x20000",
      "extraData": "",
      "gasLimit": "0x2fefd8",
      "nonce": "0x0000000000000042",// "0x" + Math.floor(Math.random() * 10000000000000000),
      "mixhash": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "timestamp": "0x00"
    }

    const fs = require('fs')
    fs.writeFileSync(path, JSON.stringify(content), 'utf8')
  }

  resetTempDir() {
    rimraf.sync('./temp/eth') // Right now still hard-coded because I don't trust rm -rf.
    const fs = require('fs')
    if (!fs.existsSync(this.config.tempPath)) {
      fs.mkdirSync(this.config.tempPath)
    }
  }

  initialize() {
    this.resetTempDir()
    const GenesisPath = this.config.tempPath + '/genesis.json'
    this.createGenesisFile(GenesisPath)
    this.mainNode = this.createNode()
    this.enode = this.mainNode.getNodeUrl()
  }

  start() {
    return this.mainNode.start()
  }

  stop() {
    return promiseEach(this.nodes, node => node.stop())
  }
}