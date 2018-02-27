"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
var MockWeb3 = (function () {
    function MockWeb3() {
        this.eth = new MockEth();
        this.personal = new MockPersonal();
        this.eth.getAccounts = this.personal.getAccounts; // eth not responsible for account generation but for some reason has a read function. Copying it from personal on initialization.
    }
    MockWeb3.prototype.setProvider = function () {
        return;
    };
    return MockWeb3;
}());
exports.MockWeb3 = MockWeb3;
var MockEth = (function () {
    function MockEth() {
        this.transactions = [];
        this.coinbase = randomAddress();
    }
    MockEth.prototype.getGasPrice = function () {
        return Math.floor(Math.random() * 1e+6);
    };
    MockEth.prototype.getBalance = function (address, callback) {
        var creditTxs = this.transactions.filter(function (tx) { return tx.to === address; });
        var debitTxs = this.transactions.filter(function (tx) { return tx.from === address; });
        var credits = creditTxs.reduce(function (acc, tx) { return tx.value + acc; }, 0);
        var debits = debitTxs.reduce(function (acc, tx) { return tx.value + acc; }, 0);
        return credits - debits;
    };
    MockEth.prototype.getBlock = function (hashOrNumber, includeTxs, callback) {
        var hash, number;
        var getByHash = this.transactions.find(function (tx) { return tx.hash === hashOrNumber; });
        var getByNumber = this.transactions.find(function (tx) { return tx.block === hashOrNumber; });
        var blockTransactions = getByHash || getByNumber;
        if (!getByHash) {
            number = hashOrNumber;
        }
        if (!getByNumber) {
            hash = hashOrNumber;
        }
        var block = {
            hash: hash || randomTxHash(),
            number: number || randomBlockNumber(),
            timestamp: Date.now().toString(),
            transactions: blockTransactions
        };
        return callback(null, block);
    };
    MockEth.prototype.getBlockNumber = function (callback) {
        return callback(null, randomBlockNumber());
    };
    MockEth.prototype.getTransaction = function (hash) {
        var tx = this.transactions.find(function (tx) { return tx.hash === hash; });
        return tx || randomTx();
    };
    MockEth.prototype.getTransactionReceipt = function (txHash, callback) {
        var getTx = this.getTransaction(txHash);
        var receipt = {
            blockHash: randomTxHash(),
            blockNumber: getTx.block,
            transactionHash: txHash,
            transactionIndex: Math.floor(Math.random() * 10),
            from: getTx.from,
            to: getTx.to,
            cumulativeGasUsed: Math.floor(Math.random() * 100000),
            gasUsed: Math.floor(Math.random() * 10000),
            contractAddress: randomAddress(),
            logs: '',
            status: '0x1'
        };
    };
    MockEth.prototype.sendTransaction = function (transaction, callback) {
        var hash = randomTxHash();
        var transactionWithId = Object.assign({ hash: hash, block: randomBlockNumber(), status: '1' }, transaction);
        this.transactions.push(transactionWithId);
        return callback(null, hash);
    };
    return MockEth;
}());
exports.MockEth = MockEth;
var MockPersonal = (function () {
    function MockPersonal() {
        this.accounts = [];
    }
    MockPersonal.prototype.unlockAccount = function (address, callback) {
        return callback(null, true);
    };
    MockPersonal.prototype.newAccount = function (callback) {
        var newAccount = randomAddress();
        this.accounts.push(newAccount);
        return callback(null, newAccount);
    };
    MockPersonal.prototype.getAccounts = function () {
        return Promise.resolve(this.accounts);
    };
    return MockPersonal;
}());
exports.MockPersonal = MockPersonal;
// Random helpers
function randomTxHash() {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
function randomBlockNumber() {
    return Math.floor(Math.random() * 1e+6).toString();
}
function randomAddress() {
    return '0x' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
function randomTx() {
    return {
        hash: randomTxHash(),
        to: randomAddress(),
        from: randomAddress(),
        value: new bignumber_js_1.default(Math.floor(Math.random() * 100)),
        block: randomBlockNumber(),
        status: '1'
    };
}
//# sourceMappingURL=mock-web3.js.map