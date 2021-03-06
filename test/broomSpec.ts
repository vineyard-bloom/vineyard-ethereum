import {Broom, Bristle} from '../src/sweep'
import {Web3EthereumClient} from '../src/ethereum-client'
import {EthereumTransaction} from '../src/types'

export class PretendEthereumManager {
  hasAddress

  constructor() {
    this.hasAddress = true
  }

  saveTransaction(transaction: EthereumTransaction, blockIndex: number) {
    return Promise.resolve({to: '', from: '', value: '', gas: 1, hash: 1})
  }

  saveSweepRecord(bristle: Bristle) {
    console.log('A \'Bristle\' has been successfully \'created\' in the \'db\'')
    return Promise.resolve({from: bristle.from, to: bristle.to, status: bristle.status, txid: bristle.txid, amount: bristle.amount})
  }

  getLastBlock(): Promise<number> {
    return Promise.resolve(1)
  }

  setLastBlock(lastblock: number): Promise<void> {
    return Promise.resolve()
  }

  getResolvedTransactions(confirmedBlockNumber: number): Promise<EthereumTransaction[]> {
    return Promise.resolve([{to: '', from: '', value: '', gas: 1, hash: 1}, {to: '', from: '', value: '', gas: 1, hash: 1}])
  }

  onConfirm(transaction: EthereumTransaction): Promise<EthereumTransaction> {
    return Promise.resolve({to: '', from: '', value: '', gas: 1, hash: 1})
  }

  onDenial(transaction: EthereumTransaction): Promise<EthereumTransaction> {
    return Promise.resolve({to: '', from: '', value: '', gas: 1, hash: 1})
  }

  setStatus(transaction: EthereumTransaction, value): Promise<EthereumTransaction> {
    return Promise.resolve({to: '', from: '', value: '', gas: 1, hash: 1})
  }

  getDustyAddresses() {
    return Promise.resolve(['0x2c0cc734dffd2f024bc1b1b3f11ba3e5edaa1241', '0xa99608cf77751fee2a9771ba3fbd27f43066be09', '0x0f676b1e3943ac5eefe42de49b57dda7892a0084'])
  }

}


const broom = new Broom(500,  new PretendEthereumManager(), new Web3EthereumClient({http: 'http://localhost:8545', sweepAddress: '0x3a72dc83b33786b7a836d70dbb2cc78df8116a4d'}))

// broom.calculateSendAmount(2000000).then(amount => console.log(amount))
broom.sweep().then(sweepResult => console.log(sweepResult))
