import BigNumber from 'bignumber.js'
import { EthereumTransaction, GethTransaction } from '../src'

export class MockWeb3 {
  eth: MockEth
  personal: MockPersonal

  constructor () {
    this.eth = new MockEth()
    this.personal = new MockPersonal()
    this.eth.getAccounts = this.personal.getAccounts // eth not responsible for account generation but for some reason has a read function. Copying it from personal on initialization.
  }

  setProvider() {
    return
  }
}

export class MockEth {
  transactions: GethTransaction[]
  coinbase: string
  getAccounts: Function

  constructor() {
    this.transactions = []
    this.coinbase = randomAddress()
  }

  getGasPrice() {
    return Math.floor(Math.random() * 1e+6)
  }

  getBalance(address: string, callback: Function) {
    const creditTxs = this.transactions.filter(tx => tx.to === address)
    const debitTxs = this.transactions.filter( tx => tx.from === address)
    const credits = creditTxs.reduce((acc, tx) => tx.value + acc, 0)
    const debits = debitTxs.reduce((acc, tx) => tx.value + acc, 0)
    return credits - debits
  }
  // TODO: Check which functions are async or not
  getBlock(hashOrNumber: string, includeTxs: boolean, callback: Function) {
    const getByHash = this.transactions.filter(tx => tx.hash === hashOrNumber)
    const getByNumber = this.transactions.filter(tx => tx.block === hashOrNumber)
    const blockTransactions = getByHash || getByNumber
  }

  getBlockNumber (callback: Function) {
    return callback(null, randomBlockNumber())
  }

  getTransaction (hash: string) {
    const tx = this.transactions.filter(tx => tx.hash === hash)
    return tx || randomTx()
  }

  getTransactionReceipt (txHash: string, callback: Function) {

  }

  sendTransaction(transaction: EthereumTransaction, callback: Function) {
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
    callback(null, true)
  }

  newAccount() {
    const newAccount = randomAddress()
    this.accounts.push(newAccount)
    return newAccount
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

function randomTx (): GethTransaction {
  return {
    hash: randomTxHash(),
    to: randomAddress(),
    from: randomAddress(),
    value: new BigNumber(Math.floor(Math.random() * 100)),
    block: randomBlockNumber(),
    status: '1'
  }
}