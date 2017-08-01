import {GethNode, mine} from "./"
import {GethNodeConfig} from "./geth-node";


function fund(node: GethNode) {
  const web3 = node.getWeb3()
  return new Promise<void>((resolve, reject) => {
    console.log(web3.eth.getBalance(web3.eth.coinbase), "coinbase balance")
    const send = () => {
      web3.personal.unlockAccount(web3.eth.coinbase)
      web3.eth.sendTransaction({
        from: web3.eth.coinbase,
        to: web3.eth.accounts[1],
        value: web3.toWei(8)
      }, function (err, tx) {
        if (err) {
          console.log(err)
          reject(err)
        }
        else {
          console.log(tx)
          resolve(tx)
        }
      })
    }
    setTimeout(send, 1000)
  })
    .then(result => console.log(web3.eth.getTransaction(result)))
}

function spend(node: GethNode, miner?: GethNode) {
  const web3 = node.getWeb3()
  return new Promise<void>((resolve, reject) => {
    mine(miner, 8547, 30000)
    const send = () => {
      console.log(web3.eth.getBalance(web3.eth.accounts[1]), "account 1 balance")
      web3.personal.unlockAccount(web3.eth.accounts[1])
      web3.eth.sendTransaction({
        from: web3.eth.accounts[1],
        to: web3.eth.accounts[2],
        value: web3.toWei(5)
      }, function (err, tx) {
        if (err) {
          console.log(err)
          reject(err)
        }
        else {
          console.log(tx)
          resolve(tx)
        }
      })
    }
    setTimeout(send, 15000)
  })
    .then(result => console.log(web3.eth.getTransaction(result)))
}

export function doubleSpend(config?: GethNodeConfig) {
  const node1 = new GethNode(config)
  const node2 = new GethNode(config)
    mine(node1, 8546, 30000).then(() => node1.start(8546).then(() => fund(node1)).then(() => spend(node1, node2))
      .then(() => node2.start(8546))
      .then(() => fund(node2)).then(() => spend(node2))) 
}
