import { TokenContract, GethNode } from '../lab'
import { Web3EthereumClient } from '../src/ethereum-client'
const config =  require('./config/general-secret.json')

const TestRPC = require('ethereumjs-testrpc');

const ethConfig = config.testRpc ? TestRPC.provider() : 'http://localhost:8545'

// should be config.abi
const abi = require('./res/abi.json')



//should be config.address
// const address = "0x6b9f85527043d105326453d664a687025354c443"

//testrpc salt contract address
const address = '0xf4112eb0a7d82341cb5f4c5b23a8dd36c5e96d1d'

const ethClient = new Web3EthereumClient({http: ethConfig, sweepAddress: ''})
// const node = new GethNode()
const tokenContract = new TokenContract(ethClient)

// let currentBlock
// ethClient.getBlockNumber().then(result => {
//   console.log(result)
//   currentBlock = result
// })

//add promises
// node.start().then(() => {
//   console.log('node started')
// tokenContract.watchContract()
// tokenContract.loadContract(abi)
//   .then(contract => {
//     tokenContract.loadContractAddress(contract, address)
//     .then(instance => {
// tokenContract.watchContract(instance, address)
//   .then(res => {
//     console.log('***res', res, ethClient.getWeb3().eth.accounts[0], ethClient.getWeb3().eth.accounts[1])

// for (var i = 0; i < 23; ++i) {
tokenContract.transfer(abi, address, 'transfer', ethClient.getWeb3().eth.accounts[0], ethClient.getWeb3().eth.accounts[1], ethClient.toWei(10))
  .then(hash => {
    tokenContract.getTransactionReceipt(hash).then(result => {
      console.log(result)
    })
  }).catch(e => {
    console.error(e)
  })
// }).catch(e => {
//     console.error(e)
//   })
// }).catch(e => {
//     console.error(e)
//   })
// }).catch(e => {
//     console.error(e)
//   })
// node.stop()
