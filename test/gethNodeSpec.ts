import { GethNode } from '../lab/geth-node'

const node = new GethNode()

node.createBlockchain(8545)
console.log(node.startChildProcess)
node.attachMiner(8546)
node.stopBlockchain()
