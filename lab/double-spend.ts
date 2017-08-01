import {GethNode, mine} from "./"
import {GethNodeConfig} from "./geth-node";


function fund(node: GethNode) {
  const web3 = node.getWeb3()
  return new Promise<void>((resolve, reject) => {
    const send = () => {
      web3.personal.unlockAccount(web3.eth.coinbase)
      web3.eth.sendTransaction({
        from: web3.eth.coinbase,
        to: web3.eth.accounts[1],
        value: web3.toWei(35)
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
    setTimeout(fund, 10000)
  })
    .then(result => console.log(web3.eth.getTransaction(result)))
}

function spend(node: GethNode) {
  const web3 = node.getWeb3()
  return new Promise<void>((resolve, reject) => {
    const send = () => {
      web3.personal.unlockAccount(web3.eth.accounts[1])
      web3.eth.sendTransaction({
        from: web3.eth.accounts[1],
        to: web3.eth.accounts[2],
        value: web3.toWei(18)
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
    setTimeout(send, 10000)
  })
    .then(result => console.log(web3.eth.getTransaction(result)))
}

export function doubleSpend(config?: GethNodeConfig) {
  const node1 = new GethNode(config)
  const node2 = new GethNode(config)
    node1.start(8546).then(() => fund(node1)).then(() => spend(node1))
      .then(() => mine(node2, 8547, 19000).then(() => fund(node2))
      .then(() => node2.start(8546)).then(() => spend(node2))) 
}
