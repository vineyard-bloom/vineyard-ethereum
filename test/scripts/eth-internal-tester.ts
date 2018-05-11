import { Web3EthereumClient } from '../../src'

const ethereumClient = new Web3EthereumClient({ http: 'http://localhost:8545' })

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
}