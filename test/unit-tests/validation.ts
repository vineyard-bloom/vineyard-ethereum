import { validateBlock } from '../../src/client-functions'
const assert = require('assert')
const minute = 60 * 1000


describe('a local ethereum network', function () {
  this.timeout(2 * minute)

  it('works', async function () {
    const blockParams = {
      "bloom" : "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "coinbase" : "0x8888f1f195afa192cfee860698584c030f4c9db1",
      "difficulty" : "0x040000",
      "extraData" : "",
      "gasLimit" : "0x2fefd8",
      "mixHash" : "0x0a55dc80ced5e71738a5a15e12f63be192a65c5cb257f8ee10c875c9599b5b52",
      "number" : "0x02",
      "parentHash" : "0x7285abd5b24742f184ad676e31f6054663b3529bc35ea2fcad8a3e0f642a46f7",
      "receiptTrie" : "0x056b23fbba480696b65fe5a59b8f2148a1299103c4f57df839233af2cf4ca2d2",
      "stateRoot" : "0xecc60e00b3fe5ce9f6e1a10e5469764daf51f1fe93c22ec3f9a7583a80357217",
      "transactionsTrie" : "0x53d5b71a8fbb9590de82d69dfa4ac31923b0c8afce0d30d0d8d1e931f25030dc",
      "rlp" : "0xf90260f901f9a07285abd5b24742f184ad676e31f6054663b3529bc35ea2fcad8a3e0f642a46f7a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347948888f1f195afa192cfee860698584c030f4c9db1a0ecc60e00b3fe5ce9f6e1a10e5469764daf51f1fe93c22ec3f9a7583a80357217a053d5b71a8fbb9590de82d69dfa4ac31923b0c8afce0d30d0d8d1e931f25030dca0056b23fbba480696b65fe5a59b8f2148a1299103c4f57df839233af2cf4ca2d2b90100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008302000001832fefd88252088459af017880a00a55dc80ced5e71738a5a15e12f63be192a65c5cb257f8ee10c875c9599b5b5288ba58e9414abfa06ff861f85f800a82c35094095e7baea6a6c7c4c2dfeb977efac326af552d870a801ba0f3266921c93d600c43f6fa4724b7abae079b35b9e95df592f95f9f3445e94c88a012f977552ebdb7a492cf35f3106df16ccb4576ebad4113056ee1f52cbe4978c1c0",
    }

    validateBlock(blockParams)
    .then(( hashedBlock ) => {
      assert.equal('befba14e51e96b78dd6ec42dac0573db0590e26c24441167fa1bd0d16afb41bf', hashedBlock)
    })
  })
})