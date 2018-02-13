"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = require("bignumber.js");
class MockWeb3 {
    constructor() {
        this.eth = new MockEth();
        this.personal = new MockPersonal();
        this.eth.getAccounts = this.personal.getAccounts; // eth not responsible for account generation but for some reason has a read function. Copying it from personal on initialization.
    }
    setProvider() {
        return;
    }
}
exports.MockWeb3 = MockWeb3;
class MockEth {
    constructor() {
        this.transactions = [];
        this.coinbase = randomAddress();
    }
    getGasPrice() {
        return Math.floor(Math.random() * 1e+6);
    }
    getBalance(address, callback) {
        const creditTxs = this.transactions.filter(tx => tx.to === address);
        const debitTxs = this.transactions.filter(tx => tx.from === address);
        const credits = creditTxs.reduce((acc, tx) => tx.value + acc, 0);
        const debits = debitTxs.reduce((acc, tx) => tx.value + acc, 0);
        return credits - debits;
    }
    getBlock(hashOrNumber, includeTxs, callback) {
        let hash, number;
        const getByHash = this.transactions.find(tx => tx.hash === hashOrNumber);
        const getByNumber = this.transactions.find(tx => tx.block === hashOrNumber);
        const blockTransactions = getByHash || getByNumber;
        if (!getByHash) {
            number = hashOrNumber;
        }
        if (!getByNumber) {
            hash = hashOrNumber;
        }
        const block = {
            hash: hash || randomTxHash(),
            number: number || randomBlockNumber(),
            timestamp: Date.now().toString(),
            transactions: blockTransactions
        };
        return callback(null, block);
    }
    getBlockNumber(callback) {
        return callback(null, randomBlockNumber());
    }
    getTransaction(hash) {
        const tx = this.transactions.find(tx => tx.hash === hash);
        return tx || randomTx();
    }
    getTransactionReceipt(txHash, callback) {
        const getTx = this.getTransaction(txHash);
        const receipt = {
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
    }
    sendTransaction(transaction, callback) {
        const hash = randomTxHash();
        const transactionWithId = Object.assign({ hash: hash, block: randomBlockNumber(), status: '1' }, transaction);
        this.transactions.push(transactionWithId);
        return callback(null, hash);
    }
}
exports.MockEth = MockEth;
class MockPersonal {
    constructor() {
        this.accounts = [];
    }
    unlockAccount(address, callback) {
        callback(null, true);
    }
    newAccount() {
        const newAccount = randomAddress();
        this.accounts.push(newAccount);
        return newAccount;
    }
    getAccounts() {
        return Promise.resolve(this.accounts);
    }
}
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