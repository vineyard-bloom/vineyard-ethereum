import { EthereumNetwork } from '../../lab'
import { assert } from 'chai'
import BigNumber from 'bignumber.js'
import {
  deployContract, getTransactionReceipt, traceTransaction, unlockWeb3Account,
  Web3EthereumClient
} from '../../src'
import { Web3Client } from '../../src/client-functions'
import { GethNode } from '../../lab/geth-node'

const promisify = require('util').promisify
const fs = require('fs')
const solc = require('solc')
require('source-map-support').install()

const minute = 60 * 1000

const solidityCode1 = fs.readFileSync(__dirname + '/../res/internal-call-value.sol', 'utf8')
const solidityCode2 = fs.readFileSync(__dirname + '/../res/internal-transfer.sol', 'utf8')
const solidityCode3 = fs.readFileSync(__dirname + '/../res/internal-send.sol', 'utf8')

interface TestState {
  client: Web3EthereumClient
  miners: GethNode[]
  network: EthereumNetwork
  web3: Web3Client
}

interface ContractBundle {
  bytecode: string
  contract: any
}

function compileContract(web3: Web3Client, name: string, code: string): ContractBundle {
  let output = solc.compile({ sources: { [name + '.sol']: code } }, 1)
  let parts = output.contracts[name + '.sol:Sender']
  let abi = parts.interface
  let bytecode = '0x' + parts.bytecode
  let contract = web3.eth.contract(JSON.parse(abi))
  return {
    contract,
    bytecode
  }
}

describe('ethereum-contract', function () {
  this.timeout(4 * minute)
  let state: TestState | undefined

  const sendAmount = new BigNumber('124004000010000')

  async function deployContractPlus(bundle: ContractBundle) {
    const { client, miners, network, web3 } = state!
    let gasEstimate = await promisify(web3.eth.estimateGas.bind(web3.eth))({
      data: bundle.bytecode,
      from: network.getCoinbase()
    })
    let txid = await deployContract(web3, {
      data: bundle.bytecode,
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
    let instance = bundle.contract.at(receipt.contractAddress)
    return {
      instance,
      contractAddress: receipt.contractAddress,
      gasEstimate: gasEstimate
    }
  }

  before(async function () {
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

    state = {
      client,
      miners,
      network,
      web3,
    }
  })

  it('can detect internal transfers 1', async function () {
    const { client, miners, network, web3 } = state!

    const address2 = await client.createAddress()

    // Create contract
    let bundle = compileContract(web3, 'internal-call-value', solidityCode1) // web3.eth.contract(JSON.parse(abi))
    await unlockWeb3Account(web3, network.getCoinbase())
    console.log('block', await client.getWeb3().eth.blockNumber)
    const { instance, contractAddress, gasEstimate } = await deployContractPlus(bundle)
    console.log('block', await client.getWeb3().eth.blockNumber)

    let data = await instance.send.getData(address2)
    let contractSendTx = await web3.eth.sendTransaction({
      from: network.getCoinbase(),
      to: contractAddress,
      data: data,
      value: 7,
      gas: gasEstimate,
      gasPrice: 20000000000
    })
    await miners[0].mineBlocks(5, 200 * 1000)
    assert(web3.eth.getBalance(address2).toString() === '7')
    let callLog = await traceTransaction(web3, contractSendTx)
    console.log('callLog', callLog)
    // assert(callLog[0].address === address2)
    // assert(callLog[0].value === 7)
  })
  // END OF CALL.VALUE TRANSFER

  it('can detect internal transfers 2', async function () {
    const { client, miners, network, web3 } = state!

    const address1 = await client.createAddress()
    const address2 = await client.createAddress()

    console.log('block', await client.getWeb3().eth.blockNumber)
    let { contract, bytecode } = compileContract(web3, 'internal-transfer', solidityCode2)
    console.log('block', await client.getWeb3().eth.blockNumber)
    const gasEstimate = await promisify(web3.eth.estimateGas.bind(web3.eth))({
      data: bytecode,
      from: address1
    })
    await unlockWeb3Account(web3, network.getCoinbase())
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

    // END OF .TRANSFER TRANSFER
  })

  it('can detect internal transfers 3', async function () {
    const { client, miners, network, web3 } = state!

    const address1 = await client.createAddress()
    const address2 = await client.createAddress()

    console.log('block', await client.getWeb3().eth.blockNumber)
    // const output = solc.compile(
    //   { sources: { 'internal-send.sol': solidityCode3 } },
    //   1
    // )
    // const parts = output.contracts['internal-send.sol:Sender']
    // const abi = parts.interface
    // const bytecode = '0x' + parts.bytecode
    // const contract = web3.eth.contract(JSON.parse(abi))
    let { contract, bytecode } = compileContract(web3, 'internal-send', solidityCode3)

    console.log('block', await client.getWeb3().eth.blockNumber)
    const gasEstimate = await promisify(web3.eth.estimateGas.bind(web3.eth))({
      data: bytecode,
      from: address1
    })
    await unlockWeb3Account(web3, network.getCoinbase())
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

})