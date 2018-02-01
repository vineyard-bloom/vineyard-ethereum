"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fund(client) {
    var web3 = client;
    return new Promise(function (resolve, reject) {
        console.log(web3.eth.getBalance(web3.eth.coinbase).toNumber(), 'I AM THE COINBASE BALANCE');
        web3.personal.unlockAccount(web3.eth.coinbase);
        web3.eth.sendTransaction({
            from: web3.eth.coinbase,
            to: web3.eth.accounts[1],
            value: web3.toWei(35)
        }, function (err, tx) {
            resolve(tx);
        });
    });
}
function spend(node) {
    var web3 = node.getWeb3();
    fund(web3).then(function () {
        return new Promise(function (resolve, reject) {
            var send = function () {
                web3.personal.unlockAccount(web3.eth.accounts[1]);
                web3.eth.sendTransaction({
                    from: web3.eth.accounts[1],
                    to: web3.eth.accounts[2],
                    value: web3.toWei(18)
                }, function (err, tx) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    else {
                        console.log(tx);
                        resolve(tx);
                    }
                });
            };
            setTimeout(send, 10000);
        })
            .then(function (result) { return console.log(web3.eth.getTransaction(result)); });
    });
}
// export function doubleSpend(config?: GethNodeConfig) {
//   const node1 = new GethNode(config)
//   const node2 = new GethNode(config)
//     node1.start(8546).then(() => spend(node1))
//       .then(() => mine(node2, 8547, 9000).then(() => node2.start(8546)).then(() => spend(node2)))
// }
//# sourceMappingURL=double-spend.js.map