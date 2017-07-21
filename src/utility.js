"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
var promise_each2_1 = require("promise-each2");
function ethToWei(amount) {
    return amount.times(new bignumber_js_1.default("1000000000000000000"));
}
exports.ethToWei = ethToWei;
function weiToEth(amount) {
    return amount.dividedBy(new bignumber_js_1.default("1000000000000000000"));
}
exports.weiToEth = weiToEth;
function checkAllBalances(eth, web3) {
    var totalBal = 0;
    for (var acctNum in eth.accounts) {
        var acct = eth.accounts[acctNum];
        var acctBal = web3.fromWei(eth.getBalance(acct), "ether");
        totalBal += parseFloat(acctBal);
        console.log("  eth.accounts[" + acctNum + "]: \t" + acct + " \tbalance: " + acctBal + " ether");
    }
    console.log("  Total balance: " + totalBal + " ether");
}
exports.checkAllBalances = checkAllBalances;
;
function getTransactionsByAccount(eth, account, startBlockNumber, endBlockNumber) {
    if (startBlockNumber === void 0) { startBlockNumber = 0; }
    if (endBlockNumber === void 0) { endBlockNumber = eth.blockNumber; }
    console.log("Searching for transactions to/from account \"" + account + "\" within blocks " + startBlockNumber + " and " + endBlockNumber);
    var promises = [];
    var transactions = [];
    var _loop_1 = function (i) {
        // if (i % 1000 == 0) {
        //   console.log("Searching block " + i);
        // }
        promises.push(function () { return eth.getBlock(i, true, function (err, block) {
            if (block != null && block.transactions != null) {
                transactions = transactions.concat(block.transactions.map(function (e) {
                    if (account == "*" || account == e.from || account == e.to) {
                        return {
                            hash: e.hash,
                            nonce: e.nonce,
                            blockHash: e.blockHash,
                            blockNumber: e.blockNumber,
                            transactionIndex: e.transactionIndex,
                            from: e.from,
                            to: e.to,
                            value: e.value,
                            time: block.timestamp + " " + new Date(block.timestamp * 1000).toISOString(),
                            gasPrice: e.gasPrice,
                            gas: e.gas,
                            input: e.input
                        };
                    }
                }));
            }
            else {
                return Promise.resolve();
            }
        }); });
    };
    for (var i = startBlockNumber; i <= endBlockNumber; i++) {
        _loop_1(i);
    }
    return promise_each2_1.each(promises)
        .then(function () { return transactions; });
}
exports.getTransactionsByAccount = getTransactionsByAccount;
//# sourceMappingURL=utility.js.map