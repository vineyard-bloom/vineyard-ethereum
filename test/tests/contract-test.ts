import { EthereumNetwork } from '../../lab'
import { assert } from 'chai'
import BigNumber from 'bignumber.js'
import { deployContract, getTransactionReceipt, unlockWeb3Account } from '../../src'

const promisify = require('util').promisify

const fs = require('fs')

// const truffleContract = require('truffle-contract')
const solc = require('solc')

require('source-map-support').install()

const minute = 60 * 1000

const solidityCode = fs.readFileSync(__dirname + '/../res/internal-transfer.sol', 'utf8')

async function createContract(web3: any) {
  // const output = solc.compile({ sources: { 'internal-transfer.sol': solidityCode } }, 1)
  // const parts = output.contracts['internal-transfer.sol:Sender']
  // const {abi, bytecode} = parts.interface

  return
}

describe('ethereum-contract', function () {
  this.timeout(2 * minute)

  it('works', async function () {

    // Setup Ethereum Network
    const config = require('../config/config.json')
    const network = new EthereumNetwork(config.ethereum)
    network.initialize()
    const miners = await network.createMiners(2)
    const node = await network.createControlNode()

    const client = node.getClient()
    const web3 = client.getWeb3()

    // Create addresses
    const address1 = await client.createAddress()
    const address2 = await client.createAddress()

    // Populate contract address
    const sendAmount = new BigNumber('124004000010000')
    const tx = await client.sendTransaction({
      from: network.getCoinbase(),
      to: address1,
      value: sendAmount
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    const amount = await client.getBalance(address1)
    assert.equal(sendAmount.toString(), amount.toString())

    // Create contract
    console.log('block', await client.getWeb3().eth.blockNumber)
    // const contract = createContract(client.getWeb3())
    const output = solc.compile({ sources: { 'internal-transfer.sol': solidityCode } }, 1)
    const parts = output.contracts['internal-transfer.sol:Sender']
    const abi = parts.interface
    const bytecode = '0x' + parts.bytecode
    const contract = web3.eth.contract(JSON.parse(abi))
    console.log('block', await client.getWeb3().eth.blockNumber)

    const gasEstimate = await promisify(web3.eth.estimateGas.bind(web3.eth))({ data: bytecode, from: address1 })
    await unlockWeb3Account(web3, address1)
    const txid = await deployContract(web3, {
      data: bytecode,
      from: network.getCoinbase(),
      gas: gasEstimate,
      gasPrice: 20000000000,
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    const receipt = await getTransactionReceipt(web3, txid)
    const instance = contract.at(receipt.contractAddress)
    const data = await instance.send.getData(7)
    const gasEstimate2 = await promisify(web3.eth.estimateGas.bind(web3.eth))({ data: instance.send.getData(7), from: network.getCoinbase(), to: receipt.contractAddress })
    const contractSendTx = await web3.eth.sendTransaction({
      from: network.getCoinbase(),
      to: receipt.contractAddress,
      data: instance.send.getData(7),
      gas: gasEstimate2,
      gasPrice: 20000000000 
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    assert(true)
  })
})