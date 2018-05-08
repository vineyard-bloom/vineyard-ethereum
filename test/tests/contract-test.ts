import { EthereumNetwork } from '../../lab'
import { assert } from 'chai'
import BigNumber from 'bignumber.js'
import { deployContract, getTransactionReceipt, unlockWeb3Account } from '../../src'
const promisify = require('util').promisify
const fs = require('fs')
const solc = require('solc')
require('source-map-support').install()

const minute = 60 * 1000

const solidityCode1 = fs.readFileSync(__dirname + '/../res/internal-call-value.sol', 'utf8')
const solidityCode2 = fs.readFileSync(__dirname + '/../res/internal-transfer.sol', 'utf8')
const solidityCode3 = fs.readFileSync(__dirname + '/../res/internal-send.sol', 'utf8')

describe('ethereum-contract', function () {
  this.timeout(2 * minute)
  
  it('can detect internal transfers using .call.value()', async function () {
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

    // Create contract
    console.log('block', await client.getWeb3().eth.blockNumber)
    const output = solc.compile({ sources: { 'internal-call-value.sol': solidityCode1 } }, 1)
    const parts = output.contracts['internal-call-value.sol:Sender']
    const abi = parts.interface
    const bytecode = '0x' + parts.bytecode
    const contract = web3.eth.contract(JSON.parse(abi))
    console.log('block', await client.getWeb3().eth.blockNumber)
    const gasEstimate = await promisify(web3.eth.estimateGas.bind(web3.eth))({ data: bytecode, from: address1 })
    await unlockWeb3Account(web3, network.getCoinbase())
    const txid = await deployContract(web3, {
      data: bytecode,
      from: network.getCoinbase(),
      gas: gasEstimate,
      gasPrice: 20000000000,
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    const receipt = await getTransactionReceipt(web3, txid)
    const tx = await client.sendTransaction({
      from: network.getCoinbase(),
      to: receipt.contractAddress,
      value: sendAmount
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    const instance = contract.at(receipt.contractAddress)

    const data = await instance.send.getData(address2)
    const contractSendTx = await web3.eth.sendTransaction({
      from: network.getCoinbase(),
      to: receipt.contractAddress,
      data: data,
      value: 7,
      gas: gasEstimate,
      gasPrice: 20000000000 
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    assert(web3.eth.getBalance(address2).toString() === '7')
    const callLog = await client.traceTransaction(contractSendTx)
    assert(callLog[0].address === address2)
    assert(callLog[0].value === 7)
  })

  it('can detect internal transfers using .transfer()', async function() {
  // Create addresses
    const address1 = await client.createAddress()
    const address2 = await client.createAddress()

  // Populate contract address
    const sendAmount = new BigNumber('124004000010000')

  // Create contract
    console.log('block', await client.getWeb3().eth.blockNumber)
    const output = solc.compile(
    { sources: { 'internal-transfer.sol': solidityCode2 } },
    1
  )
    const parts = output.contracts['internal-transfer.sol:Sender']
    const abi = parts.interface
    const bytecode = '0x' + parts.bytecode
    const contract = web3.eth.contract(JSON.parse(abi))
    console.log('block', await client.getWeb3().eth.blockNumber)
    const gasEstimate = await promisify(web3.eth.estimateGas.bind(web3.eth))({
      data: bytecode,
      from: address1
    })
    // await unlockWeb3Account(web3, network.getCoinbase())
    const txid = await deployContract(web3, {
      data: bytecode,
      from: network.getCoinbase(),
      gas: gasEstimate,
      gasPrice: 20000000000
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    const receipt = await getTransactionReceipt(web3, txid)
    const tx = await client.sendTransaction({
      from: network.getCoinbase(),
      to: receipt.contractAddress,
      value: sendAmount
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    const instance = contract.at(receipt.contractAddress)

    const data = await instance.send.getData(address2, 7)
    const contractSendTx = await web3.eth.sendTransaction({
      from: network.getCoinbase(),
      to: receipt.contractAddress,
      data: data,
      value: 0,
      gas: gasEstimate,
      gasPrice: 20000000000
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    assert(web3.eth.getBalance(address2).toString() === '7')
    const callLog = await client.traceTransaction(contractSendTx)
    assert(callLog[0].address === address2)
    assert(callLog[0].value === 7)
  })

  it('can detect internal transfers using .send()', async function() {
  
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

  // Create contract
    console.log('block', await client.getWeb3().eth.blockNumber)
    const output = solc.compile(
    { sources: { 'internal-send.sol': solidityCode3 } },
    1
  )
    const parts = output.contracts['internal-send.sol:Sender']
    const abi = parts.interface
    const bytecode = '0x' + parts.bytecode
    const contract = web3.eth.contract(JSON.parse(abi))
    console.log('block', await client.getWeb3().eth.blockNumber)
    const gasEstimate = await promisify(web3.eth.estimateGas.bind(web3.eth))({
      data: bytecode,
      from: address1
    })
    const txid = await deployContract(web3, {
      data: bytecode,
      from: network.getCoinbase(),
      gas: gasEstimate,
      gasPrice: 20000000000
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    const receipt = await getTransactionReceipt(web3, txid)
    const tx = await client.sendTransaction({
      from: network.getCoinbase(),
      to: receipt.contractAddress,
      value: sendAmount
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    const instance = contract.at(receipt.contractAddress)

    const data = await instance.send.getData(address2, 7)
    const contractSendTx = await web3.eth.sendTransaction({
      from: network.getCoinbase(),
      to: receipt.contractAddress,
      data: data,
      value: 0,
      gas: gasEstimate,
      gasPrice: 20000000000
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    assert(web3.eth.getBalance(address2).toString() === '7')
    const callLog = await client.traceTransaction(contractSendTx)
    assert(callLog[0].address === address2)
    assert(callLog[0].value === '7')
  })
})