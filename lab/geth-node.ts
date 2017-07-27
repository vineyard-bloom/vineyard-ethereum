import {EthereumClient, Web3EthereumClient} from "../src"
import * as Web3 from 'web3'
const child_process = require('child_process')

enum Status {
  inactive,
  active
}

export class GethNode {
  private status: Status = Status.inactive
  private stdout
  private stderr
  private childProcess
  public node
  client: EthereumClient

  constructor() {
      this.node = new Web3()
      this.node.setProvider(new this.node.providers.HttpProvider("http://localhost:8545/"))
  }

  getClient() {
    return this.node 
  }

  doubleSpend() {
    return new Promise<void>((resolve, reject) => {
      const send = () => {
            console.log(this.node.eth.getBalance(this.node.eth.coinbase).toNumber(), "I AM THE COINBASE BALANCE")
            this.node.personal.unlockAccount(this.node.eth.coinbase)
            this.node.eth.sendTransaction({from: this.node.eth.coinbase, to: this.node.eth.accounts[1], value: this.node.toWei(35)}, function(err, tx) {
              if(err) {console.log(err)}
              else {console.log(tx)}
            })
            resolve()
          }
      setTimeout(send, 10000)
    })
  }

  start() {
    console.log('Starting Geth')
      const childProcess = this.childProcess= child_process.exec('geth --dev  --verbosity 4  --rpc --rpcport 8545 --rpcapi=\"db,eth,net,web3,personal,web3\" --keystore ./keystores console')

    childProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    childProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    })

  }

  stop() {
    if (!this.childProcess)
      return Promise.resolve()

    return new Promise((resolve, reject) => {
      this.childProcess.kill()
      this.childProcess.on('close', (code) => {
        resolve()
      })
    })

  }
}