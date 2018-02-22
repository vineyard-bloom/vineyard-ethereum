
require('source-map-support').install()
import { BlockScanner, Web3EthereumClient } from "../../src/index";
import * as assert from "assert";

class FakeModel {
  setStatus() {
    return Promise.resolve()
  }

  onConfirm() {
    return Promise.resolve(true)
  }

  onDenial() {
    return Promise.resolve(false)
  }
}

const model = new FakeModel()
const config = require('../config/config.json')
const client = new Web3EthereumClient(config.client)
const scanner = new BlockScanner(model, client)

async function main() {
  {
    const transaction = {
      txid: '0x474f5fda12b96455f58fb3c0b56af899e8f2a23e4163f7e75739b2b8681333f4',
      blockIndex: 5126521,
    }
    const result = await scanner.resolveTransaction(transaction)
    console.log('result', result)
    assert(result)
  }
  {
    const transaction = {
      txid: '0x37ecc0a75dfd3a54bbf00dba3742ba250c68e242895b01b85ae0ae9e7f50ba80',
      blockIndex: 5126522,
    }
    const result = await scanner.resolveTransaction(transaction)
    console.log('result', result)
    assert(!result)
  }
}

main()