"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Web3 = require("web3");
var utility_1 = require("./utility");
var bignumber_js_1 = require("bignumber.js");
var vineyard_blockchain_1 = require("vineyard-blockchain");
var util = require("util");
var Web3EthereumClient = /** @class */ (function () {
    function Web3EthereumClient(ethereumConfig, web3) {
        this.web3 = web3 || new Web3();
        this.web3.setProvider(new this.web3.providers.HttpProvider(ethereumConfig.http));
    }
    Web3EthereumClient.prototype.getWeb3 = function () {
        return this.web3;
    };
    Web3EthereumClient.prototype.getNextBlockInfo = function (previousBlock) {
        var web3GetBlock = util.promisify(this.web3.eth.getBlock);
        return web3GetBlock(previousBlock.index + 1).then(function (nextBlock) {
            return {
                hash: nextBlock.hash,
                index: nextBlock.number,
                timeMinded: nextBlock.timestamp
            };
        });
    };
    Web3EthereumClient.prototype.getFullBlock = function (block) {
        var web3GetBlock = util.promisify(this.web3.eth.getBlock);
        return web3GetBlock(block).then(function (fullBlock) {
            return {
                hash: fullBlock.hash,
                index: fullBlock.number,
                timeMined: fullBlock.timestamp,
                transactions: fullBlock.transactions
            };
        });
    };
    Web3EthereumClient.prototype.getTransactionStatus = function (txid) {
        var web3GetTransactionReceipt = util.promisify(this.web3.eth.getTransactionReceipt);
        return web3GetTransactionReceipt(txid).then(function (transaction) {
            return transaction.status.substring(2) == "0" ? vineyard_blockchain_1.TransactionStatus.rejected : vineyard_blockchain_1.TransactionStatus.accepted;
        });
    };
    Web3EthereumClient.prototype.getTransaction = function (txid) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.web3.eth.getTransaction(txid, function (err, block) {
                if (err) {
                    console.error('Error querying transaction', txid, 'with message', err.message);
                    reject(new Error(err));
                }
                else {
                    resolve(block);
                }
            });
        });
    };
    Web3EthereumClient.prototype.getCoinbase = function () {
        return Promise.resolve(this.web3.eth.coinbase);
    };
    Web3EthereumClient.prototype.toWei = function (amount) {
        return this.web3.toWei(amount);
    };
    Web3EthereumClient.prototype.fromWei = function (amount) {
        return new bignumber_js_1.default(amount).dividedBy(1000000000000000000).toString();
    };
    Web3EthereumClient.prototype.createAddress = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // if (!this.web3.isConnected()) {
            //   reject(new Error("Cannot create address, not connected to client."))
            // }
            _this.web3.personal.newAccount(function (err, result) {
                if (err)
                    reject(new Error("Error creating address: " + err.message));
                else {
                    console.log('Created new address', result);
                    resolve(result);
                }
            });
        });
    };
    Web3EthereumClient.prototype.getAccounts = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.web3.eth.getAccounts(function (err, result) {
                if (err)
                    reject(new Error("Error getting accounts: " + err.message));
                else
                    resolve(result);
            });
        });
    };
    Web3EthereumClient.prototype.getBalance = function (address) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.web3.eth.getBalance(address, function (err, result) {
                if (err)
                    reject(new Error("Error getting balance: " + err.message));
                else
                    resolve(result);
            });
        });
    };
    Web3EthereumClient.prototype.unlockAccount = function (address) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                _this.web3.personal.unlockAccount(address, function (err, result) {
                    if (err)
                        reject(new Error("Error unlocking account: " + err.message));
                    else
                        resolve(result);
                });
            }
            catch (error) {
                reject(new Error("Error unlocking account: " + address + '.  ' + error.message));
            }
        });
    };
    Web3EthereumClient.prototype.send = function (from, to, amount) {
        var _this = this;
        var transaction = from && typeof from === 'object'
            ? from
            : { from: from, to: to, value: amount, gas: 21000 };
        if (!transaction.from)
            throw Error("Ethereum transaction.from cannot be empty.");
        if (!transaction.to)
            throw Error("Ethereum transaction.to cannot be empty.");
        if (transaction.from === '')
            transaction.from = this.web3.eth.coinbase;
        var original = Object.assign({}, transaction);
        transaction.value = transaction.value.toString();
        transaction.gasPrice = this.web3.toWei(transaction.gasPrice, 'gwei');
        return this.unlockAccount(transaction.from)
            .then(function () {
            // const hexAmount = this.web3.toHex(amount)
            return new Promise(function (resolve, reject) {
                _this.web3.eth.sendTransaction(transaction, function (err, txid) {
                    if (err) {
                        console.log('Error sending (original)', original);
                        reject('Error sending to ' + to + ": " + err);
                    }
                    else {
                        console.log('Sent Ethereum transaction', txid, _this.web3.eth.getTransaction(txid));
                        transaction.hash = txid;
                        resolve(transaction);
                    }
                });
            });
        });
    };
    // listAllTransactions(addressManager: AddressManager, lastBlock: number): Promise<EthereumTransaction[]> {
    //   return getTransactionsFromRange(this.web3.eth, lastBlock, addressManager)
    // }
    Web3EthereumClient.prototype.importAddress = function (address) {
        throw new Error("Not implemented");
    };
    Web3EthereumClient.prototype.generate = function (blockCount) {
        throw new Error("Not implemented.");
    };
    Web3EthereumClient.prototype.checkAllBalances = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve(utility_1.checkAllBalances(_this.web3));
        });
    };
    Web3EthereumClient.prototype.getBlock = function (blockIndex) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.web3.eth.getBlock(blockIndex, true, function (err, block) {
                if (err) {
                    console.error('Error processing ethereum block', blockIndex, 'with message', err.message);
                    reject(new Error(err));
                }
                else {
                    resolve(block);
                }
            });
        });
    };
    Web3EthereumClient.prototype.getBlockNumber = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.web3.eth.getBlockNumber(function (err, blockNumber) {
                if (err) {
                    console.error('Error processing ethereum block number', blockNumber, 'with message', err.message);
                    reject(new Error(err));
                }
                else {
                    resolve(blockNumber);
                }
            });
        });
    };
    Web3EthereumClient.prototype.getGas = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.web3.eth.getGasPrice(function (err, result) {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    };
    return Web3EthereumClient;
}());
exports.Web3EthereumClient = Web3EthereumClient;
//# sourceMappingURL=ethereum-client.js.map