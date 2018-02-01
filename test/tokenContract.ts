import { TokenContract } from '../lab'
import { Web3EthereumClient } from '../src/ethereum-client'

const config = require('./config/general-secret.json')

const TestRPC = require('ethereumjs-testrpc')

const ethConfig = config.testRpc ? TestRPC.provider() : 'http://localhost:8545'

const abi = require('./res/abi.json')

const saltContractAddress = '0x6b9f85527043d105326453d664a687025354c443'

// testrpc salt contract address
const address = '0x3cf8390712ab180df3ebfb3cd6e43f96712c2917'

const ethClient = new Web3EthereumClient({http: ethConfig, sweepAddress: ''})
// const node = new GethNode()
const tokenContract = new TokenContract(ethClient)

// make number of tx's logged to what last block number was for client?
tokenContract.transfer(abi, address, ethClient.getWeb3().eth.accounts[0], ethClient.getWeb3().eth.accounts[1], 100000000)
  .then(hash => {
    tokenContract.getTransactionReceipt(hash).then(result => {
      console.log(result)
      tokenContract.getTotalSupply(abi, address)
        .then(total => console.log(total))

      tokenContract.getBalanceOf(abi, address, ethClient.getWeb3().eth.accounts[0])
        .then(result => console.log(result, ethClient.getWeb3().eth.accounts[0]))

      tokenContract.getBalanceOf(abi, address, ethClient.getWeb3().eth.accounts[1])
        .then(result => console.log(result, ethClient.getWeb3().eth.accounts[1]))

      tokenContract.getBalanceOf(abi, address, ethClient.getWeb3().eth.accounts[2])
        .then(result => console.log(result, ethClient.getWeb3().eth.accounts[2]))
    })
  }).catch(e => {
  console.error(e)
})

// NOTE watcher flow
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

// node.stop()
