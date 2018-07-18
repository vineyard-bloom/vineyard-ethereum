import { Web3EthereumClient } from '../../src'

const assert = require('assert')
const minute = 60 * 1000
const config = require('../config/config.json')

describe('ethereum client', async function () {
  this.timeout(2 * minute)
  const web3Config = { http: config.ethereum.http }
  const client = new Web3EthereumClient(web3Config)

  it('can get the highest block index', async function () {
    const blockIndex = await client.getBlockIndex()
    assert(blockIndex, 'it should return the highest block index')
  })

  it('can get newest block', async function () {
    const lastBlock = await client.getLastBlock()
    assert(lastBlock, 'it should return the newest block on the node')
    assert(lastBlock.hash, 'the block should contain a hash')
    assert(lastBlock.index, 'the block should contain an index')
    assert(lastBlock.timeMined, 'the block should contain timeMined')
  })

  // getNextBlockInfo
  it('can get the next block info', async function () {
    const nextBlock = await client.getBlockIndex()
    assert(nextBlock, '')
  })

  // getFullBlock
  // getTransactionStatus
  // getTransactionReceipt
  // getTransaction
  // fromWei
  // getAccounts
  // getBalance
  // getBlock
  // getBlockNumber
  // getGas
})