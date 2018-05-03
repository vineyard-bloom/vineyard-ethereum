import { partitionArray } from '../../src'
import { assert } from 'chai'
import { getEvents } from "../../src/utility";

require('source-map-support').install()

const Web3 = require('web3')
const config = require('../config/config.json')
const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereum.http))

describe('utility-test', function () {

  it('partitions arrays', async function () {
    const input = [1, 2, 3, 4, '5']

    {
      const result = partitionArray(2, input)
      assert.deepEqual(result, [[1, 2], [3, 4], ['5']])
    }

    {
      const result = partitionArray(3, input)
      assert.deepEqual(result, [[1, 2, 3], [4, '5']])
    }

  })

  it('can get contract events', async function() {
    const events = await getEvents(web3, {
      toBlock: 4086319, fromBlock: 4086319
    })

    assert(events.length > 0)
  })
})
