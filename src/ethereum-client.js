"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var utility_1 = require("./utility");
var bignumber_js_1 = require("bignumber.js");
var vineyard_blockchain_1 = require("vineyard-blockchain");
var util = require("util");
var Web3 = require("web3");
var Web3EthereumClient = /** @class */ (function () {
    function Web3EthereumClient(ethereumConfig, web3) {
        this.web3 = web3 || new Web3();
        this.web3.setProvider(new this.web3.providers.HttpProvider(ethereumConfig.http));
    }
    Web3EthereumClient.prototype.getWeb3 = function () {
        return this.web3;
    };
    Web3EthereumClient.prototype.getLastBlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lastBlock, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.getBlock;
                        return [4 /*yield*/, this.getBlockNumber()];
                    case 1: return [4 /*yield*/, _a.apply(this, [_b.sent()])];
                    case 2:
                        lastBlock = _b.sent();
                        return [2 /*return*/, {
                                hash: lastBlock.hash,
                                index: lastBlock.number,
                                timeMined: new Date(lastBlock.timestamp),
                                currency: "ETH00000-0000-0000-0000-000000000000"
                            }];
                }
            });
        });
    };
    Web3EthereumClient.prototype.getNextBlockInfo = function (previousBlock) {
        return __awaiter(this, void 0, void 0, function () {
            var nextBlockIndex, nextBlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nextBlockIndex = previousBlock ? previousBlock.index + 1 : 0;
                        return [4 /*yield*/, this.getBlock(nextBlockIndex)];
                    case 1:
                        nextBlock = _a.sent();
                        return [2 /*return*/, {
                                hash: nextBlock.hash,
                                index: nextBlock.number,
                                timeMined: new Date(nextBlock.timestamp),
                                currency: "ETH00000-0000-0000-0000-000000000000"
                            }];
                }
            });
        });
    };
    Web3EthereumClient.prototype.getFullBlock = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var fullBlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBlock(block.index)];
                    case 1:
                        fullBlock = _a.sent();
                        return [2 /*return*/, {
                                hash: fullBlock.hash,
                                index: fullBlock.number,
                                timeMined: new Date(fullBlock.timestamp),
                                transactions: fullBlock.transactions
                            }];
                }
            });
        });
    };
    Web3EthereumClient.prototype.getTransactionStatus = function (txid) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionReceipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTransactionReceipt(txid)];
                    case 1:
                        transactionReceipt = _a.sent();
                        return [2 /*return*/, transactionReceipt.status.substring(2) == "0" ? vineyard_blockchain_1.TransactionStatus.rejected : vineyard_blockchain_1.TransactionStatus.accepted];
                }
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
    Web3EthereumClient.prototype.getTransactionReceipt = function (txid) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.web3.eth.getTransactionReceipt(txid, function (err, transaction) {
                if (err) {
                    console.error('Error querying transaction', txid, 'with message', err.message);
                    reject(err);
                }
                else {
                    resolve(transaction);
                }
            });
        });
    };
    Web3EthereumClient.prototype.getTransaction = function (txid) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.web3.eth.getTransaction(txid, function (err, transaction) {
                if (err) {
                    console.error('Error querying transaction', txid, 'with message', err.message);
                    reject(err);
                }
                else {
                    resolve(transaction);
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