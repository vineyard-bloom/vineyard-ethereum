import BigNumber from 'bignumber.js';
import {each as promiseEach} from 'promise-each2'

export function ethToWei(amount) {
  return amount.times(new BigNumber("1000000000000000000"))
}

export function weiToEth(amount) {
  return amount.dividedBy(new BigNumber("1000000000000000000"))
}

export function checkAllBalances(eth, web3) {
  var totalBal = 0;
  for (var acctNum in eth.accounts) {
    var acct = eth.accounts[acctNum];
    var acctBal = web3.fromWei(eth.getBalance(acct), "ether");
    totalBal += parseFloat(acctBal);
    console.log("  eth.accounts[" + acctNum + "]: \t" + acct + " \tbalance: " + acctBal + " ether");
  }
  console.log("  Total balance: " + totalBal + " ether");
};


function createTransaction(e, block) {
  return {
    hash: e.hash,
    nonce: e.nonce,
    blockHash: e.blockHash,
    blockNumber: e.blockNumber,
    transactionIndex: e.transactionIndex,
    from: e.from,
    to: e.to,
    value: e.value,
    time: new Date(block.timestamp * 1000),
    gasPrice: e.gasPrice,
    gas: e.gas,
    input: e.input
  }
}

function getTransactions(eth, account, i): Promise<any[]> {
  return new Promise((resolve, reject) => {
    eth.getBlock(i, true, (err, block) => {
      if (err)
        return reject(new Error(err));

      if (!block || !block.transactions)
        return resolve([])
      if (block.transactions.length > 0)
        console.log("transactions", block.transactions.length)

      const result = block.transactions
        .filter(e => account == e.to)
        .map(e => createTransaction(e, block))

      resolve(result)
    })
  })
}

export function getTransactionsByAccount(eth, account, i = 0, endBlockNumber = eth.blockNumber): Promise<any[]> {
  if (i > endBlockNumber)
    return Promise.resolve([])

  return getTransactions(eth, account, i)
    .then(first => getTransactionsByAccount(eth, account, i + 1, endBlockNumber)
      .then(second => first.concat(second)))
}

// export function getTransactionsByAccount(eth, account, startBlockNumber = 0, endBlockNumber = eth.blockNumber) {
//   console.log("Searching for transactions to/from account \"" + account + "\" within blocks " + startBlockNumber + " and " + endBlockNumber);
//
//   const promises = []
//   let transactions = []
//
//   for (let i = startBlockNumber; i <= endBlockNumber; i++) {
//     // if (i % 1000 == 0) {
//     //   console.log("Searching block " + i);
//     // }
//
//     promises.push(() => eth.getBlock(i, true, (err, block) => {
//         if (block != null && block.transactions != null) {
//           transactions = transactions.concat(block.transactions.map(function (e) {
//             if (account == "*" || account == e.from || account == e.to) {
//               return {
//                 hash: e.hash,
//                 nonce: e.nonce,
//                 blockHash: e.blockHash,
//                 blockNumber: e.blockNumber,
//                 transactionIndex: e.transactionIndex,
//                 from: e.from,
//                 to: e.to,
//                 value: e.value,
//                 time: block.timestamp + " " + new Date(block.timestamp * 1000).toISOString(),
//                 gasPrice: e.gasPrice,
//                 gas: e.gas,
//                 input: e.input
//               }
//             }
//           }))
//         }
//         else {
//           return Promise.resolve()
//         }
//       })
//     )
//   }
//
//   return promiseEach(promises)
//     .then(() => transactions)
// }