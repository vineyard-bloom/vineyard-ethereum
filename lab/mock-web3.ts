import { EthereumTransaction, GethTransaction } from '../src'

export class MockWeb3 {
  eth: MockEth
  personal: MockPersonal

  constructor () {
    this.eth = new MockEth()
    this.personal = new MockPersonal()
  }

  setProvider() {
    return
  }
}

export class MockEth {
  transactions: GethTransaction[]
  coinbase: string

  constructor() {
    this.transactions = []
    this.coinbase = this.randomAddress()
  }

  getGasPrice() {

  }

  getAccounts() {

  }

  getBalance() {

  }

  getBlock(blockIndex, someBoolean, callback) {

  }

  getBlockNumber (callback: Function) {
    return callback(null, this.randomBlockNumber())
  }

  getTransaction (hash: string) {
    const tx = this.transactions.filter(tx => tx.hash = hash)
    return tx || this.randomTx()
  }

  getTransactionReceipt (txHash: string, callback: Function) {

  }

  sendTransaction(transaction: EthereumTransaction, callback: Function) {
    const hash = this.randomTxHash()
    const transactionWithId = Object.assign({ hash: hash, block: this.randomBlockNumber(), status: '1' }, transaction)
    this.transactions.push(transactionWithId)
    return callback(null, hash)
  }

  private randomTxHash (): string {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  }

  private randomBlockNumber (): string {
    return Math.floor(Math.random() * 1e+6).toString()
  }

  private randomAddress (): string {
    return '0x' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  }

  private randomTx (): GethTransaction {
    return {
      hash: this.randomTxHash(),
      to: this.randomAddress(),
      from: this.randomAddress(),
      value: Math.floor(Math.random() * 100),
      block: this.randomBlockNumber(),
      status: '1'
    }
  }
}

export class MockPersonal {

  unlockAccount(address: string, callback: Function) {
    callback(null, true)
  }

  newAccount() {

  }
}