import { EthereumNetwork } from '../lab'

require('source-map-support').install()
import {assert, expect} from 'chai'
import { Web3EthereumClient } from '../src'

describe('a local ethereum network', function () {
  this.timeout(5000)

  it('works', async function () {
    const config = require('../config/config.json')
    const network = new EthereumNetwork(config.ethereum)
    network.initialize()
    const miner = network.createNode()
    const miner2 = network.createNode()
    const node = network.createNode()
    await miner.startMining()
    await miner2.startMining()
    await miner.listPeers()
    await node.start()
    const ethereumClient = new Web3EthereumClient()

  })
})
