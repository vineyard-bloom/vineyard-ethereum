"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fromWei(amount) {
    return amount * 1000000000000000000;
}
exports.fromWei = fromWei;
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
    var _loop_1 = function () {
        if (i % 1000 == 0) {
            console.log("Searching block " + i);
        }
        var block = eth.getBlock(i, true);
        if (block != null && block.transactions != null) {
            return { value: block.transactions.map(function (e) {
                    if (account == "*" || account == e.from || account == e.to) {
                        return {
                            txHash: e.hash,
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
                }) };
        }
    };
    for (var i = startBlockNumber; i <= endBlockNumber; i++) {
        var state_1 = _loop_1();
        if (typeof state_1 === "object")
            return state_1.value;
    }
}
exports.getTransactionsByAccount = getTransactionsByAccount;
//# sourceMappingURL=utility.js.map