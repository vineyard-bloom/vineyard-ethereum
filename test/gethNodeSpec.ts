import { GethNode } from '../lab/geth-node'
import { Web3EthereumClient } from '../src/ethereum-client'

const ethClient = new Web3EthereumClient({http: 'http://localhost:8545', sweepAddress: ''})
const node = new GethNode()

// node.start(8545)
// console.log(node.startChildProcess)
// node.attachMiner(8545)
// ethClient.getAccounts().then(accounts => console.log('Accounts: ', accounts))
// node.stopBlockchain()
