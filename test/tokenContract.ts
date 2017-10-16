import { TokenContract, GethNode } from '../lab'
import { Web3EthereumClient } from '../src/ethereum-client'
const config =  require('./config/general-secret.json')

const TestRPC = require('ethereumjs-testrpc');

const ethConfig = config.testRpc ? TestRPC.provider() : 'http://localhost:8545'

const abi = require('./res/abi.json')

// should be config.abi
// const abi = [
//     {
//       "constant": true,
//       "inputs": [],
//       "name": "name",
//       "outputs": [
//         {
//           "name": "",
//           "type": "string"
//         }
//       ],
//       "payable": false,
//       "type": "function"
//     },
//     {
//       "constant": false,
//       "inputs": [
//         {
//           "name": "_spender",
//           "type": "address"
//         },
//         {
//           "name": "_value",
//           "type": "uint256"
//         }
//       ],
//       "name": "approve",
//       "outputs": [
//         {
//           "name": "success",
//           "type": "bool"
//         }
//       ],
//       "payable": false,
//       "type": "function"
//     },
//     {
//       "constant": true,
//       "inputs": [],
//       "name": "totalSupply",
//       "outputs": [
//         {
//           "name": "",
//           "type": "uint256"
//         }
//       ],
//       "payable": false,
//       "type": "function"
//     },
//     {
//       "constant": false,
//       "inputs": [
//         {
//           "name": "_from",
//           "type": "address"
//         },
//         {
//           "name": "_to",
//           "type": "address"
//         },
//         {
//           "name": "_value",
//           "type": "uint256"
//         }
//       ],
//       "name": "transferFrom",
//       "outputs": [
//         {
//           "name": "success",
//           "type": "bool"
//         }
//       ],
//       "payable": false,
//       "type": "function"
//     },
//     {
//       "constant": true,
//       "inputs": [],
//       "name": "decimals",
//       "outputs": [
//         {
//           "name": "",
//           "type": "uint8"
//         }
//       ],
//       "payable": false,
//       "type": "function"
//     },
//     {
//       "constant": true,
//       "inputs": [],
//       "name": "version",
//       "outputs": [
//         {
//           "name": "",
//           "type": "string"
//         }
//       ],
//       "payable": false,
//       "type": "function"
//     },
//     {
//       "constant": true,
//       "inputs": [
//         {
//           "name": "_owner",
//           "type": "address"
//         }
//       ],
//       "name": "balanceOf",
//       "outputs": [
//         {
//           "name": "balance",
//           "type": "uint256"
//         }
//       ],
//       "payable": false,
//       "type": "function"
//     },
//     {
//       "constant": true,
//       "inputs": [],
//       "name": "symbol",
//       "outputs": [
//         {
//           "name": "",
//           "type": "string"
//         }
//       ],
//       "payable": false,
//       "type": "function"
//     },
//     {
//       "constant": false,
//       "inputs": [
//         {
//           "name": "_to",
//           "type": "address"
//         },
//         {
//           "name": "_value",
//           "type": "uint256"
//         }
//       ],
//       "name": "transfer",
//       "outputs": [
//         {
//           "name": "success",
//           "type": "bool"
//         }
//       ],
//       "payable": false,
//       "type": "function"
//     },
//     {
//       "constant": true,
//       "inputs": [
//         {
//           "name": "_owner",
//           "type": "address"
//         },
//         {
//           "name": "_spender",
//           "type": "address"
//         }
//       ],
//       "name": "allowance",
//       "outputs": [
//         {
//           "name": "remaining",
//           "type": "uint256"
//         }
//       ],
//       "payable": false,
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "payable": false,
//       "type": "constructor"
//     },
//     {
//       "payable": false,
//       "type": "fallback"
//     },
//     {
//       "anonymous": false,
//       "inputs": [
//         {
//           "indexed": true,
//           "name": "_from",
//           "type": "address"
//         },
//         {
//           "indexed": true,
//           "name": "_to",
//           "type": "address"
//         },
//         {
//           "indexed": false,
//           "name": "_value",
//           "type": "uint256"
//         }
//       ],
//       "name": "Transfer",
//       "type": "event"
//     },
//     {
//       "anonymous": false,
//       "inputs": [
//         {
//           "indexed": true,
//           "name": "_owner",
//           "type": "address"
//         },
//         {
//           "indexed": true,
//           "name": "_spender",
//           "type": "address"
//         },
//         {
//           "indexed": false,
//           "name": "_value",
//           "type": "uint256"
//         }
//       ],
//       "name": "Approval",
//       "type": "event"
//     }
//   ]

//should be config.address
// const address = "0x6b9f85527043d105326453d664a687025354c443"

//testrpc salt contract address
const address = '0x811372aee24feb836a0f639d3291426e9e4d4bff'

const ethClient = new Web3EthereumClient({http: ethConfig, sweepAddress: ''})
// const node = new GethNode()
const tokenContract = new TokenContract(ethClient)

//add promises
// node.start().then(() => {
//   console.log('node started')
  tokenContract.transfer(abi, address, 'transfer', ethClient.getWeb3().eth.accounts[0], ethClient.getWeb3().eth.accounts[1], ethClient.toWei(10))
  // tokenContract.transfer(abi, address, 'transfer', 'fefaaa8ed3373da6f4bf54f491bad9029d0be749', '0x6fc520fc3b6facbe26f1b4ff159f2aecbb032032', 10)
    // .then(txid => {
    //   console.log('*transaction successful*', txid)
    // }).catch(e => {
    //   console.error('*error* ', e)
    // })
// }).catch(e => {
//   console.error('*error* ', e)
// })
// node.stop()
