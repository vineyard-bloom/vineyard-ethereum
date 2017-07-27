import {GethNode} from "./"

function spend(node) {
  return new Promise<void>((resolve, reject) => {
    const send = () => {
      console.log(node.eth.getBalance(node.eth.coinbase).toNumber(), "I AM THE COINBASE BALANCE")
      node.personal.unlockAccount(node.eth.coinbase)
      node.eth.sendTransaction({
        from: node.eth.coinbase,
        to: node.eth.accounts[1],
        value: node.toWei(35)
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
  const node1 = new GethNode()
  const node2 = new GethNode()

  return spend(node1)
    .then(() => spend(node2))
}
