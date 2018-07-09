import { EthereumNetwork } from '../../lab/index'
import { assert } from 'chai'
import BigNumber from 'bignumber.js'
import { deployContract, getTransactionReceipt, unlockWeb3Account } from '../../src/index'
const promisify = require('util').promisify
const fs = require('fs')
const solc = require('solc')
require('source-map-support').install()

const minute = 60 * 1000

const solidityCode = fs.readFileSync(__dirname + '/../res/all-transfer-ops.sol', 'utf8')

describe('ethereum-contract', function () {
  this.timeout(4 * minute)

  it('can detect internal transfers', async function () {
    // Setup Ethereum Network
    const config = require('../config/config.json')
    const network = new EthereumNetwork(config.ethereum)
    network.initialize()
    const miners = await network.createMiners(2)
    const node = await network.createControlNode()

    const client = node.getClient()
    const web3 = client.getWeb3()

    // Create addresses
    let address1 = await client.createAddress()
    let address2 = await client.createAddress()

    // Populate contract address
    const sendAmount = new BigNumber('124004000010000')

    // Create contract
    console.log('block', await client.getWeb3().eth.blockNumber)
    let output = solc.compile({ sources: { 'all-transfer-ops.sol': solidityCode } }, 1)
    let partsC = output.contracts['all-transfer-ops.sol:C']
    let partsD = output.contracts['all-transfer-ops.sol:D']
    let partsE = output.contracts['all-transfer-ops.sol:E']
    let abiC = JSON.parse(partsC.interface)
    let abiD = JSON.parse(partsD.interface)
    let abiE = JSON.parse(partsE.interface)
    let bytecode1 = '0x' + partsC.bytecode
    let bytecode2 = '0x' + partsD.bytecode + partsE.bytecode
    let merged = [].concat(abiC, abiD, abiE)
    let contract = web3.eth.contract(merged)
    console.log('block', await client.getWeb3().eth.blockNumber)
    let gasEstimate1 = await promisify(web3.eth.estimateGas.bind(web3.eth))({ data: bytecode1, from: network.getCoinbase() })
    let gasEstimate2 = await promisify(web3.eth.estimateGas.bind(web3.eth))({ data: bytecode2, from: network.getCoinbase() })
    await unlockWeb3Account(web3, network.getCoinbase())
    let txid1 = await deployContract(web3, {
      data: bytecode1,
      from: network.getCoinbase(),
      gas: gasEstimate1,
      gasPrice: 20000000000,
    })
    let txid2 = await deployContract(web3, {
      data: bytecode2,
      from: network.getCoinbase(),
      gas: gasEstimate2,
      gasPrice: 20000000000
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    let receipt1 = await getTransactionReceipt(web3, txid1)
    let receipt2 = await getTransactionReceipt(web3, txid2)
    let tx1 = await client.sendTransaction({
      from: network.getCoinbase(),
      to: receipt1.contractAddress,
      value: sendAmount
    })
    let tx2 = await client.sendTransaction({
      from: network.getCoinbase(),
      to: receipt2.contractAddress,
      value: sendAmount
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    let instance = contract.at(receipt1.contractAddress)
    let instance2 = contract.at(receipt2.contractAddress)
    let data = await instance.foo.getData(receipt2.contractAddress, receipt2.contractAddress, 8)
    let contractSendTx1 = await web3.eth.sendTransaction({
      from: network.getCoinbase(),
      to: receipt1.contractAddress,
      data: data,
      value: 0,
      gas: gasEstimate1,
      gasPrice: 20000000000 
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    // assert(web3.eth.getBalance(address2).toString() === '8')
    let callLog = await client.traceTransaction(contractSendTx1)
    assert(callLog[0].address === address2)
    assert(callLog[0].value === 8)

  })
})