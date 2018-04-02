import { partitionArray } from '../../src'
import { assert } from 'chai'

require('source-map-support').install()

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
})