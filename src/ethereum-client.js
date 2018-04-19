"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("./utility");
const bignumber_js_1 = require("bignumber.js");
const vineyard_blockchain_1 = require("vineyard-blockchain");
const client_functions_1 = require("./client-functions");
const util = require('util');
const Web3 = require('web3');
class Web3EthereumClient {
    constructor(config, web3) {
        this.web3 = utility_1.initializeWeb3(config, web3);
    }
    getWeb3() {
        return this.web3;
    }
    getBlockIndex() {
        return new Promise((resolve, reject) => {
            this.web3.eth.getBlockNumber((err, blockNumber) => {
                if (err) {
                    console.error('Error processing ethereum block number', blockNumber, 'with message', err.message);
                    reject(new Error(err));
                }
                else {
                    resolve(blockNumber);
                }
            });
        });
    }
    getLastBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            let lastBlock = yield this.getBlock(yield this.getBlockNumber());
            return {
                hash: lastBlock.hash,
                index: lastBlock.number,
                timeMined: new Date(lastBlock.timestamp * 1000)
            };
        });
    }
    getNextBlockInfo(blockIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const nextBlockIndex = blockIndex === (null || undefined) ? 0 : blockIndex + 1;
            let nextBlock = yield this.getBlock(nextBlockIndex);
            if (!nextBlock) {
                return undefined;
            }
            return {
                hash: nextBlock.hash,
                index: nextBlock.number,
                timeMined: new Date(nextBlock.timestamp * 1000)
            };
        });
    }
    getFullBlock(blockIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            let fullBlock = yield this.getBlock(blockIndex);
            // let blockHeight = await this.getBlockNumber()
            const transactions = fullBlock.transactions.map(t => ({
                txid: t.hash,
                to: t.to,
                from: t.from,
                amount: t.value,
                timeReceived: new Date(fullBlock.timestamp * 1000),
                // confirmations: blockHeight - block.index,
                blockIndex: blockIndex,
                status: client_functions_1.convertStatus(t.status)
            }));
            return {
                hash: fullBlock.hash,
                index: fullBlock.number,
                timeMined: new Date(fullBlock.timestamp * 1000),
                transactions: transactions
            };
        });
    }
    getTransactionStatus(txid) {
        return __awaiter(this, void 0, void 0, function* () {
            let transactionReceipt = yield this.getTransactionReceipt(txid);
            return transactionReceipt.status.substring(2) === '0' ? vineyard_blockchain_1.blockchain.TransactionStatus.rejected : vineyard_blockchain_1.blockchain.TransactionStatus.accepted;
        });
    }
    unlockAccount(address) {
        return client_functions_1.unlockWeb3Account(this.web3, address);
    }
    send(from, to, amount) {
        const transaction = from && typeof from === 'object'
            ? from
            : { from: from, to: to, value: amount, gas: 21000 };
        if (!transaction.from) {
            throw Error('Ethereum transaction.from cannot be empty.');
        }
        if (!transaction.to) {
            throw Error('Ethereum transaction.to cannot be empty.');
        }
        if (transaction.from === '') {
            transaction.from = this.web3.eth.coinbase;
        }
        const original = Object.assign({}, transaction);
        transaction.value = transaction.value.toString();
        transaction.gasPrice = this.web3.toWei(transaction.gasPrice, 'gwei');
        return this.unlockAccount(transaction.from)
            .then(() => {
            // const hexAmount = this.web3.toHex(amount)
            return new Promise((resolve, reject) => {
                this.web3.eth.sendTransaction(transaction, (err, txid) => {
                    if (err) {
                        console.log('Error sending (original)', original);
                        reject('Error sending to ' + to + ': ' + err);
                    }
                    else {
                        console.log('Sent Ethereum transaction', txid, this.web3.eth.getTransaction(txid));
                        transaction.hash = txid;
                        resolve(transaction);
                    }
                });
            });
        });
    }
    getTransactionReceipt(txid) {
        return new Promise((resolve, reject) => {
            this.web3.eth.getTransactionReceipt(txid, (err, transaction) => {
                if (err) {
                    console.error('Error querying transaction', txid, 'with message', err.message);
                    reject(err);
                }
                else {
                    resolve(transaction);
                }
            });
        });
    }
    getTransaction(txid) {
        return new Promise((resolve, reject) => {
            this.web3.eth.getTransaction(txid, (err, transaction) => {
                if (err) {
                    console.error('Error querying transaction', txid, 'with message', err.message);
                    reject(err);
                }
                else {
                    resolve(transaction);
                }
            });
        });
    }
    getCoinbase() {
        return Promise.resolve(this.web3.eth.coinbase);
    }
    toWei(amount) {
        return this.web3.toWei(amount);
    }
    fromWei(amount) {
        return new bignumber_js_1.default(amount).dividedBy(1000000000000000000).toString();
    }
    createAddress(checksum = false) {
        return new Promise((resolve, reject) => {
            // if (!this.web3.isConnected()) {
            //   reject(new Error("Cannot create address, not connected to client."))
            // }
            this.web3.personal.newAccount((err, result) => {
                if (err) {
                    reject(new Error('Error creating address: ' + err.message));
                }
                else {
                    console.log('Created new address', result);
                    if (checksum) {
                        resolve(this.web3.toChecksumAddress(result));
                    }
                    else {
                        resolve(result);
                    }
                }
            });
        });
    }
    getAccounts() {
        return new Promise((resolve, reject) => {
            this.web3.eth.getAccounts((err, result) => {
                if (err) {
                    reject(new Error('Error getting accounts: ' + err.message));
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    getBalance(address) {
        return new Promise((resolve, reject) => {
            this.web3.eth.getBalance(address, (err, result) => {
                if (err) {
                    reject(new Error('Error getting balance: ' + err.message));
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    // listAllTransactions(addressManager: AddressManager, lastBlock: number): Promise<EthereumTransaction[]> {
    //   return getTransactionsFromRange(this.web3.eth, lastBlock, addressManager)
    // }
    importAddress(address) {
        throw new Error('Not implemented');
    }
    generate(blockCount) {
        throw new Error('Not implemented.');
    }
    checkAllBalances() {
        return new Promise((resolve, reject) => {
            resolve(utility_1.checkAllBalances(this.web3));
        });
    }
    getBlock(blockIndex) {
        return new Promise((resolve, reject) => {
            this.web3.eth.getBlock(blockIndex, true, (err, block) => {
                if (err) {
                    console.error('Error processing ethereum block', blockIndex, 'with message', err.message);
                    reject(new Error(err));
                }
                else {
                    resolve(block);
                }
            });
        });
    }
    getBlockNumber() {
        return new Promise((resolve, reject) => {
            this.web3.eth.getBlockNumber((err, blockNumber) => {
                if (err) {
                    console.error('Error processing ethereum block number', blockNumber, 'with message', err.message);
                    reject(new Error(err));
                }
                else {
                    resolve(blockNumber);
                }
            });
        });
    }
    sendTransaction(transaction) {
        return client_functions_1.sendWeb3Transaction(this.web3, transaction);
    }
    getGas() {
        return new Promise((resolve, reject) => {
            this.web3.eth.getGasPrice((err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
}
exports.Web3EthereumClient = Web3EthereumClient;
function cloneClient(client) {
    return new Web3EthereumClient(client.getWeb3());
}
exports.cloneClient = cloneClient;
//# sourceMappingURL=ethereum-client.js.map