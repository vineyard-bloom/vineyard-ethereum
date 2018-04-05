import { getBlockContractTransfers, getFullBlock } from '../../src'

require('source-map-support').install()
const Web3 = require('web3')

const minute = 60 * 1000

describe('token-handling', function () {
  this.timeout(2 * minute)
  const config = require('../config/config.json')
  const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereum.http))

  it('does tokens', async function () {
    const txid = '0xa7ead12fc3b20bc4555b26bcc8de55d651e90ba0da445bddad61eeaed2d28e17'
    const tx = web3.eth.getTransaction(txid)
    const txr = web3.eth.getTransactionReceipt(txid)
    console.log('tx', tx, txr)
  })

  it('does token transfers', async function () {
    const txid = '0x474f5fda12b96455f58fb3c0b56af899e8f2a23e4163f7e75739b2b8681333f4'
    // const tx = web3.eth.getTransaction(txid)
    // const txr = web3.eth.getTransactionReceipt(txid)
    const contractAddress = '0x4156D3342D5c385a87D264F90653733592000581'
    const result = await getBlockContractTransfers(web3, {
      toBlock: 5126521,
      fromBlock: 5126521,
      address: [contractAddress]
    })
    // console.log('tx', tx, txr)
    console.log('result', result)
  })

  it('does block token transfers', async function () {
    const txid = '0x474f5fda12b96455f58fb3c0b56af899e8f2a23e4163f7e75739b2b8681333f4'
    const contractAddress = '0x4156D3342D5c385a87D264F90653733592000581'
    const result = await getFullBlock(web3, 5126521)
    // console.log('tx', tx, txr)
    console.log('result', result)
  })
})