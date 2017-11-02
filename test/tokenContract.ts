import { TokenContract, GethNode } from '../lab'
import { Web3EthereumClient } from '../src/ethereum-client'
const config =  require('./config/general-secret.json')

const TestRPC = require('ethereumjs-testrpc');

const ethConfig = config.testRpc ? TestRPC.provider() : 'http://localhost:8545'

const abi = require('./res/abi.json')

//testrpc salt contract address
const address = '0x3cf8390712ab180df3ebfb3cd6e43f96712c2917'

const ethClient = new Web3EthereumClient({http: ethConfig, sweepAddress: ''})

const gethConfig = {
  gethPath: '',
  coinbase: '',
  encodes: [],
  verbosity: ''
}

// const node = new GethNode(8545)
// const client = node.getClient()
// const web3 = node.getWeb3()


//can take in flags @ end of geth command
// node.start('--dev')
// client.createAddress()


//make geth server
//deploy contract with coinbase account so coinbase account has all token balance
//make 3 accounts with some eth 
//upgrade ethereum-client to web3 1.0s


const tokenContract = new TokenContract(ethClient)
// const tokenContract = new TokenContract(client)
// for (var i = 0; i < 3; i++) {

  
  tokenContract.transfer(abi, address, ethClient.getWeb3().eth.accounts[0], ethClient.getWeb3().eth.accounts[1], 350000000)
  .then(hash => {
    tokenContract.getTransactionReceipt(hash).then(result => {
      console.log('TRANSACTION RECEIPT: ', result)
      
      // tokenContract.getTotalSupply(abi, address)
      // .then(total => console.log(total))
      
      // tokenContract.getBalanceOf(abi, address, ethClient.getWeb3().eth.accounts[0])
      // .then(result => console.log(result, ethClient.getWeb3().eth.accounts[0]))
      
      // tokenContract.getBalanceOf(abi, address, ethClient.getWeb3().eth.accounts[1])
      // .then(result => console.log(result, ethClient.getWeb3().eth.accounts[1]))
      
      // tokenContract.getBalanceOf(abi, address, ethClient.getWeb3().eth.accounts[2])
      // .then(result => console.log(result, ethClient.getWeb3().eth.accounts[2]))
    })
  }).catch(e => {
    console.error(e)
  })
// }
  
// tokenContract.getTransactionReceipt("0x1fe6b5e9520d47b5d4775fa63845bb039252f6b900bb3de67ac5b55a39cc6a98".then(result => {
//   console.log(result)
// }))

//NOTE watcher flow
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