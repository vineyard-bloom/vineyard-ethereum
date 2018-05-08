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
    let output = solc.compile({ sources: { 'internal-call-value.sol': solidityCode1 } }, 1)
    let parts = output.contracts['internal-call-value.sol:Sender']
    let abi = parts.interface
    let bytecode = '0x' + parts.bytecode
    let contract = web3.eth.contract(JSON.parse(abi))
    console.log('block', await client.getWeb3().eth.blockNumber)
    let gasEstimate = await promisify(web3.eth.estimateGas.bind(web3.eth))({ data: bytecode, from: address1 })
    await unlockWeb3Account(web3, network.getCoinbase())
    let txid = await deployContract(web3, {
      data: bytecode,
      from: network.getCoinbase(),
      gas: gasEstimate,
      gasPrice: 20000000000,
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    let receipt = await getTransactionReceipt(web3, txid)
    let tx = await client.sendTransaction({
      from: network.getCoinbase(),
      to: receipt.contractAddress,
      value: sendAmount
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    let instance = contract.at(receipt.contractAddress)

    let data = await instance.send.getData(address2)
    let contractSendTx = await web3.eth.sendTransaction({
      from: network.getCoinbase(),
      to: receipt.contractAddress,
      data: data,
      value: 7,
      gas: gasEstimate,
      gasPrice: 20000000000 
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    assert(web3.eth.getBalance(address2).toString() === '7')
    let callLog = await client.traceTransaction(contractSendTx)
    assert(callLog[0].address === address2)
    assert(callLog[0].value === 7)

    // END OF CALL.VALUE TRANSFER

    address1 = await client.createAddress()
    address2 = await client.createAddress()

    console.log('block', await client.getWeb3().eth.blockNumber)
    output = solc.compile(
    { sources: { 'internal-transfer.sol': solidityCode2 } },
    1
  )
    parts = output.contracts['internal-transfer.sol:Sender']
    abi = parts.interface
    bytecode = '0x' + parts.bytecode
    contract = web3.eth.contract(JSON.parse(abi))
    console.log('block', await client.getWeb3().eth.blockNumber)
    gasEstimate = await promisify(web3.eth.estimateGas.bind(web3.eth))({
      data: bytecode,
      from: address1
    })
    await unlockWeb3Account(web3, network.getCoinbase())
    txid = await deployContract(web3, {
      data: bytecode,
      from: network.getCoinbase(),
      gas: gasEstimate,
      gasPrice: 20000000000
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    receipt = await getTransactionReceipt(web3, txid)
    tx = await client.sendTransaction({
      from: network.getCoinbase(),
      to: receipt.contractAddress,
      value: sendAmount
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    instance = contract.at(receipt.contractAddress)

    data = await instance.send.getData(address2, 7)
    contractSendTx = await web3.eth.sendTransaction({
      from: network.getCoinbase(),
      to: receipt.contractAddress,
      data: data,
      value: 0,
      gas: gasEstimate,
      gasPrice: 20000000000
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    assert(web3.eth.getBalance(address2).toString() === '7')
    callLog = await client.traceTransaction(contractSendTx)
    assert(callLog[0].address === address2)
    assert(callLog[0].value === 7)

    // END OF .TRANSFER TRANSFER

    address1 = await client.createAddress()
    address2 = await client.createAddress()

    console.log('block', await client.getWeb3().eth.blockNumber)
    output = solc.compile(
    { sources: { 'internal-send.sol': solidityCode3 } },
    1
  )
    parts = output.contracts['internal-send.sol:Sender']
    abi = parts.interface
    bytecode = '0x' + parts.bytecode
    contract = web3.eth.contract(JSON.parse(abi))
    console.log('block', await client.getWeb3().eth.blockNumber)
    gasEstimate = await promisify(web3.eth.estimateGas.bind(web3.eth))({
      data: bytecode,
      from: address1
    })
    await unlockWeb3Account(web3, network.getCoinbase())
    txid = await deployContract(web3, {
      data: bytecode,
      from: network.getCoinbase(),
      gas: gasEstimate,
      gasPrice: 20000000000
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    receipt = await getTransactionReceipt(web3, txid)
    tx = await client.sendTransaction({
      from: network.getCoinbase(),
      to: receipt.contractAddress,
      value: sendAmount
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    instance = contract.at(receipt.contractAddress)

    data = await instance.send.getData(address2, 7)
    contractSendTx = await web3.eth.sendTransaction({
      from: network.getCoinbase(),
      to: receipt.contractAddress,
      data: data,
      value: 0,
      gas: gasEstimate,
      gasPrice: 20000000000
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    assert(web3.eth.getBalance(address2).toString() === '7')
    callLog = await client.traceTransaction(contractSendTx)
    assert(callLog[0].address === address2)
    assert(callLog[0].value === 7) 

    // END OF .SEND TRANSFER
  })

})