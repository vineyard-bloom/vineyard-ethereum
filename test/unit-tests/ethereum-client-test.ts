import { Web3EthereumClient } from '../../src'
import { blockchain } from '../../node_modules/vineyard-blockchain';

const assert = require('assert')
const minute = 60 * 1000
const config = require('../config/config.json')

describe('ethereum client', async function () {
  this.timeout(2 * minute)
  const web3Config = { http: config.ethereum.http }
  const client = new Web3EthereumClient(web3Config)

  it('gets a tx', async function () {
    const transaction = await client.getTransaction('0x569c5b35f203ca6db6e2cec44bceba756fad513384e2bd79c06a8c0181273379')
    assert.equal(transaction.from, '0xd6cb6744b7f2da784c5afd6b023d957188522198', 'transaction should have the correct "from" address')
    assert.equal(transaction.to, '0x88a690553913a795c3c668275297635b903a29e5', 'transaction should have the correct "to" address')
  })

  it('gets receipt for a tx', async function () {
    const transactionReceipt = await client.getTransactionReceipt('0x569c5b35f203ca6db6e2cec44bceba756fad513384e2bd79c06a8c0181273379')
    assert.equal(transactionReceipt.blockHash, '0x7d5a4369273c723454ac137f48a4f142b097aa2779464e6505f1b1c5e37b5382', 'receipt should have the correct block hash')
    assert.equal(transactionReceipt.status, '0x1', 'receipt should have a status of "0x1"')
  })

  it('gets tx status', async function () {
    const transactionStatus = await client.getTransactionStatus('0x569c5b35f203ca6db6e2cec44bceba756fad513384e2bd79c06a8c0181273379')
    assert.equal(transactionStatus, 1, 'tx status should be 1 (accepted)')
  })

  it('gets a full block', async function () {
    const fullBlock = await client.getFullBlock(5000000)
    assert.equal(fullBlock.index, 5000000, 'it should return block 5,000,000')
    assert.equal(fullBlock.hash, '0x7d5a4369273c723454ac137f48a4f142b097aa2779464e6505f1b1c5e37b5382', 'block should have the correct hash')
    assert.equal(fullBlock.transactions.length, 109, 'block should have 109 transactions')
  })

  it('gets next block info', async function () {
    const nextBlock = await client.getNextBlockInfo(3)
    assert.equal(nextBlock!.index, 4, 'it should return block 4')
  })

  it('gets a balance', async function () {
    const balance = await client.getBalance('0xd6cb6744b7f2da784c5afd6b023d957188522198')
    assert(balance, 'it should return a balance for that address')
  })

  it('gets highest block index', async function () {
    const blockIndex = await client.getBlockIndex()
    assert(blockIndex, 'it should return the current highest block index')
  })

  it('gets newest block', async function () {
    const lastBlock = await client.getLastBlock()
    assert(lastBlock, 'it should return the newest block on the node')
    assert(lastBlock.hash, 'the block should contain a hash')
    assert(lastBlock.index, 'the block should contain an index')
    assert(lastBlock.timeMined, 'the block should contain timeMined')
  })

  it('gets gas', async function () {
    const gas = await client.getGas()
    assert(gas, 'it should return a value for gas')
  })

  it('converts from wei', async function () {
    const fromWei = await client.fromWei(2040602716)
    assert.equal(fromWei, '2.040602716e-9', 'it should convert from wei')
  })

})