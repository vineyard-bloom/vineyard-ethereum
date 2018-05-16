import { Web3EthereumClient } from '../../src'
const ethereumClient = new Web3EthereumClient({ http: 'http://localhost:8545' })

const startIndex = process.argv[2]
const endIndex = process.argv[3]
const blocks = []

async function getBlockTransactions(index: number) {
  const block = await ethereumClient.getBlock(index)
  block.transactions.map(tx => {
    const isContractAddress = ethereumClient.isContractAddress(tx.to)
    if (isContractAddress) {
      const contractInfo = ethereumClient.traceTransaction(tx.txid)
      tx.to = contractInfo.address
      tx.value = contractInfo.value
      tx.gas = contractInfo.gas
      tx.isInternalTransaction = true
    }
    return tx
  })
  return block
}

for (let i = startIndex; i <= endIndex; i++) {
  const block = getBlockTransactions(i)
  blocks.push(block)
}

console.log(blocks)