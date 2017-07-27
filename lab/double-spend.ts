import {GethNode} from "./"

function spend(node: GethNode) {
  const web3 = node.getWeb3()
  return new Promise<void>((resolve, reject) => {
    const send = () => {
      console.log(web3.eth.getBalance(web3.eth.coinbase).toNumber(), "I AM THE COINBASE BALANCE")
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
    setTimeout(send, 10000)
  })
    .then(result => console.log(result))
}

export function doubleSpend() {
  const node1 = new GethNode(8546)
  const node2 = new GethNode(8547)

  return node1.start().then(() => spend(node1))
    .then(() => node2.start().then(() => spend(node2)))
}
