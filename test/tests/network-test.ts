import { EthereumNetwork } from '../../lab'
import { cloneClient } from '../../src'
import { assert } from 'chai'

require('source-map-support').install()

const sleep = (s: number) => new Promise(resolve => setTimeout(resolve, s * 1000))

describe('a local ethereum network', function () {
  this.timeout(60 * 1000)

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
    const client = node.getClient()
    const secondClient = cloneClient(client)
    const address1 = await client.createAddress()
    const address2 = await client.createAddress()
    const sendAmount = '124004000010000'
    const tx = await client.send(network.getCoinbase(), address1, sendAmount)
    await sleep(10)
    const amount = await client.getBalance(address1)
    assert.equal(sendAmount, amount.toString())
  })
})
