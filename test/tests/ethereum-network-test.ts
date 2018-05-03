import { EthereumNetwork } from '../../lab'
import { cloneClient } from '../../src'
import { assert } from 'chai'
import BigNumber from 'bignumber.js'

require('source-map-support').install()

const minute = 60 * 1000

const config = require('../config/config.json')

describe('a local ethereum network', function () {
  this.timeout(2 * minute)

  it('Has no errors with miners', async function () {
    const network = new EthereumNetwork(config.ethereum)
    network.initialize()
    const miners = await network.createMiners(2)
    const node = await network.createControlNode()
    await Promise.all([
      miners[0].mineBlocks(10),
      miners[1].mineBlocks(10)
    ])
  })

  it('works', async function () {
    const network = new EthereumNetwork(config.ethereum)
    network.initialize()
    const miners = await network.createMiners(2)
    const node = await network.createControlNode()
    const client = node.getClient()
    const secondClient = cloneClient(client)
    const address1 = await client.createAddress()
    const address2 = await client.createAddress()
    const sendAmount = new BigNumber('124004000010000')
    const tx = await client.sendTransaction({
      from: network.getCoinbase(),
      to: address1,
      value: sendAmount
    })
    await miners[0].mineBlocks(5)
    const amount = await client.getBalance(address1)
    assert.equal(sendAmount.toString(), amount.toString())
  })

  it('has controlled logging', async function () {
    const network = new EthereumNetwork(config.ethereum)
    network.initialize()
    const miners = await network.createMiners(2)
    const node = await network.createControlNode()
    const client = node.getClient()
    const address1 = await client.createAddress()
    const tx = await client.sendTransaction({
      from: address1,
      to: network.getCoinbase(),
      value: new BigNumber('124004000010000')
    })
  })
})