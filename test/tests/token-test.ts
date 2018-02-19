require('source-map-support').install()
const Web3 = require('web3')

const minute = 60 * 1000

describe('token-handling', function () {
  this.timeout(2 * minute)

  it('does tokens', async function () {
    const config = require('../config/config.json')
    const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereum.http))
    const txid = '0xa7ead12fc3b20bc4555b26bcc8de55d651e90ba0da445bddad61eeaed2d28e17'
    const tx = web3.eth.getTransaction(txid)
    const txr = web3.eth.getTransactionReceipt(txid)
    console.log('tx', tx, txr)
  })
})