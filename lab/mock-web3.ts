import BigNumber from 'bignumber.js'
import { EthereumTransaction, Web3Transaction } from '../src'

export class MockWeb3 {
  eth: MockEth
  personal: MockPersonal

  constructor () {
    this.eth = new MockEth()
    this.personal = new MockPersonal()
    this.eth.getAccounts = this.personal.getAccounts // eth not responsible for account generation but for some reason has a read function. Copying it from personal on initialization.
  }

  setProvider () {
    return
  }
}

export class MockEth {
  transactions: Web3Transaction[]
  coinbase: string
  getAccounts: Function

  constructor () {
    this.transactions = []
    this.coinbase = randomAddress()
  }

  getGasPrice () {
    return Math.floor(Math.random() * 1e+6)
  }

  getBalance (address: string, callback: Function) {
    const creditTxs = this.transactions.filter(tx => tx.to === address)
    const debitTxs = this.transactions.filter( tx => tx.from === address)
    const credits = creditTxs.reduce((acc, tx) => tx.value + acc, 0)
    const debits = debitTxs.reduce((acc, tx) => tx.value + acc, 0)
    return credits - debits
  }

  getBlock (hashOrNumber: string, includeTxs: boolean, callback: Function) {
    let hash, number
    const getByHash = this.transactions.find(tx => tx.hash === hashOrNumber)
    const getByNumber = this.transactions.find(tx => tx.block === hashOrNumber)
    const blockTransactions = getByHash || getByNumber
    if (!getByHash) {
      number = hashOrNumber
    }
    if (!getByNumber) {
      hash = hashOrNumber
    }
    const block = {
      hash: hash || randomTxHash(),
      number: number || randomBlockNumber(),
      timestamp: Date.now().toString(),
      transactions: blockTransactions
    }
    return callback(null, block)
  }

  getBlockNumber (callback: Function) {
    return callback(null, randomBlockNumber())
  }

  getTransaction (hash: string): Web3Transaction {
    const tx = this.transactions.find(tx => tx.hash === hash)
    return tx || randomTx()
  }

  getTransactionReceipt (txHash: string, callback: Function) {
    const getTx = this.getTransaction(txHash)
    const receipt = {
      blockHash: randomTxHash(),
      blockNumber: getTx.block,
      transactionHash: txHash,
      transactionIndex: Math.floor(Math.random() * 10),
      from: getTx.from,
      to: getTx.to,
      cumulativeGasUsed: Math.floor(Math.random() * 100000),
      gasUsed: Math.floor(Math.random() * 10000),
      contractAddress: randomAddress(),
      logs: '',
      status: '0x1'
    }
  }

  sendTransaction (transaction: EthereumTransaction, callback: Function) {
    const hash = randomTxHash()
    const transactionWithId = Object.assign({ hash: hash, block: randomBlockNumber(), status: '1' }, transaction)
    this.transactions.push(transactionWithId)
    return callback(null, hash)
  }


}

export class MockPersonal {
  accounts: string[]

  constructor() {
    this.accounts = []
  }

  unlockAccount(address: string, callback: Function) {
    return callback(null, true)
  }

  newAccount(callback: Function) {
    const newAccount = randomAddress()
    this.accounts.push(newAccount)
    return callback(null, newAccount)
  }

  getAccounts() {
    return Promise.resolve(this.accounts)
  }
}

// Random helpers
function randomTxHash (): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

function randomBlockNumber (): string {
  return Math.floor(Math.random() * 1e+6).toString()
}

function randomAddress (): string {
  return '0x' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

function randomTx (): Web3Transaction {
  return {
    hash: randomTxHash(),
    to: randomAddress(),
    from: randomAddress(),
    value: new BigNumber(Math.floor(Math.random() * 100)),
    block: randomBlockNumber(),
    status: '1'
  }
}