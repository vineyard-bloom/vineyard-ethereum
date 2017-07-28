"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Web3 = require("web3");
var utility_1 = require("./utility");
var bignumber_js_1 = require("bignumber.js");
var Web3EthereumClient = (function () {
    function Web3EthereumClient(ethereumConfig) {
        this.web3 = new Web3();
        this.web3.setProvider(new this.web3.providers.HttpProvider(ethereumConfig.http));
    }
    Web3EthereumClient.prototype.getWeb3 = function () {
        return this.web3;
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
    Web3EthereumClient.prototype.getSweepAddress = function () {
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
            _this.web3.personal.newAccount(function (err, result) {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    };
    Web3EthereumClient.prototype.getAccounts = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.web3.eth.getAccounts(function (err, result) {
                if (err)
                    reject(err);
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
                    reject(err);
                else
                    resolve(result);
            });
        });
    };
    Web3EthereumClient.prototype.send = function (fromAddress, toAddress, amount, gas) {
        var _this = this;
        if (gas === void 0) { gas = "21000"; }
        if (fromAddress === '') {
            fromAddress = this.web3.eth.coinbase;
        }
        this.web3.personal.unlockAccount(fromAddress);
        amount = this.web3.toHex(amount);
        var transaction = { from: fromAddress, to: toAddress, value: amount, gas: gas };
        return new Promise(function (resolve, reject) {
            _this.web3.eth.sendTransaction(transaction, function (err, address) {
                if (err)
                    reject('Error sending to ' + address + ": " + err);
                else
                    resolve(transaction);
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