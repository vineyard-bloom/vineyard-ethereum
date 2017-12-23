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
var types_1 = require("vineyard-blockchain/src/types");
var Web3 = require('web3');
var SolidityCoder = require('web3/lib/solidity/coder.js');
var TokenClient = (function () {
    function TokenClient(ethereumConfig, currency, tokenContractAddress, abi) {
        this.web3 = new Web3();
        this.web3.setProvider(new this.web3.providers.HttpProvider(ethereumConfig.http));
        this.tokenContractAddress = tokenContractAddress;
        this.currency = currency;
        this.methodIDs = {};
        this.abi = this.addAbi(abi);
    }
    TokenClient.prototype.getBlockIndex = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.web3.eth.getBlockNumber(function (err, blockNumber) {
                            if (err) {
                                console.error('Error processing ethereum block number', blockNumber, 'with message', err.message);
                                reject(new Error(err));
                            }
                            else {
                                resolve(blockNumber);
                            }
                        });
                    })];
            });
        });
    };
    TokenClient.prototype.getLastBlock = function () {
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
                                timeMined: new Date(lastBlock.timestamp * 1000),
                                currency: this.currency
                            }];
                }
            });
        });
    };
    TokenClient.prototype.getTransactionStatus = function (txid) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionReceipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTransactionReceipt(txid)];
                    case 1:
                        transactionReceipt = _a.sent();
                        return [2 /*return*/, transactionReceipt.status.substring(2) == "0" ? types_1.TransactionStatus.rejected : types_1.TransactionStatus.accepted];
                }
            });
        });
    };
    TokenClient.prototype.getNextBlockInfo = function (previousBlock) {
        return __awaiter(this, void 0, void 0, function () {
            var nextBlockIndex, nextBlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nextBlockIndex = previousBlock ? previousBlock.index + 1 : 0;
                        return [4 /*yield*/, this.getBlock(nextBlockIndex)];
                    case 1:
                        nextBlock = _a.sent();
                        if (!nextBlock) {
                            return [2 /*return*/, undefined];
                        }
                        return [2 /*return*/, {
                                hash: nextBlock.hash,
                                index: nextBlock.number,
                                timeMined: new Date(nextBlock.timestamp * 1000),
                                currency: this.currency
                            }];
                }
            });
        });
    };
    TokenClient.prototype.getFullBlock = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var fullBlock, blockHeight, filteredTransactions, decodedTransactions, transactions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBlock(block.index)];
                    case 1:
                        fullBlock = _a.sent();
                        return [4 /*yield*/, this.getBlockNumber()];
                    case 2:
                        blockHeight = _a.sent();
                        filteredTransactions = this.filterTokenTransaction(fullBlock.transactions);
                        return [4 /*yield*/, this.decodeTransactions(filteredTransactions)];
                    case 3:
                        decodedTransactions = _a.sent();
                        transactions = decodedTransactions.map(function (t) { return ({
                            txid: t.hash,
                            to: t.to,
                            from: t.from,
                            amount: t.value,
                            timeReceived: new Date(fullBlock.timestamp * 1000),
                            confirmations: blockHeight - block.index,
                            block: t.blockNumber,
                            status: t.status
                        }); });
                        return [2 /*return*/, {
                                hash: fullBlock.hash,
                                index: fullBlock.number,
                                timeMined: new Date(fullBlock.timestamp * 1000),
                                transactions: transactions
                            }];
                }
            });
        });
    };
    TokenClient.prototype.getBlock = function (blockIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.web3.eth.getBlock(blockIndex, true, function (err, block) {
                            if (err) {
                                console.error('Error processing ethereum block', blockIndex, 'with message', err.message);
                                reject(new Error(err));
                            }
                            else {
                                resolve(block);
                            }
                        });
                    })];
            });
        });
    };
    TokenClient.prototype.getBlockNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.web3.eth.getBlockNumber(function (err, blockNumber) {
                            if (err) {
                                console.error('Error processing ethereum block number', blockNumber, 'with message', err.message);
                                reject(new Error(err));
                            }
                            else {
                                resolve(blockNumber);
                            }
                        });
                    })];
            });
        });
    };
    TokenClient.prototype.getTransactionReceipt = function (txid) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.web3.eth.getTransactionReceipt(txid, function (err, transaction) {
                            if (err) {
                                console.error('Error querying transaction', txid, 'with message', err.message);
                                reject(err);
                            }
                            else {
                                resolve(transaction);
                            }
                        });
                    })];
            });
        });
    };
    TokenClient.prototype.filterTokenTransaction = function (transactions) {
        var _this = this;
        return transactions.filter(function (tx) {
            if (tx && tx.to) {
                return tx.to.toLowerCase() === _this.tokenContractAddress.toLowerCase();
            }
        });
    };
    TokenClient.prototype.decodeTransactions = function (transactions) {
        return __awaiter(this, void 0, void 0, function () {
            var decodedTransactions, _i, transactions_1, t, transaction, decoded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        decodedTransactions = [];
                        _i = 0, transactions_1 = transactions;
                        _a.label = 1;
                    case 1:
                        if (!(_i < transactions_1.length)) return [3 /*break*/, 4];
                        t = transactions_1[_i];
                        return [4 /*yield*/, this.web3.eth.getTransactionReceipt(t.hash)];
                    case 2:
                        transaction = _a.sent();
                        if (transaction && transaction.blockNumber && transaction.status === '0x1') {
                            decoded = this.decodeTransaction(t);
                            t.to = decoded.to;
                            t.value = decoded.value;
                            decodedTransactions.push(t);
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, decodedTransactions];
                }
            });
        });
    };
    TokenClient.prototype.decodeTransaction = function (transaction) {
        var transferTo;
        var transferValue;
        var decodedData = this.decodeMethod(transaction.input);
        if (decodedData) {
            var params = decodedData.params;
            for (var i = 0; i < params.length; ++i) {
                if (params[i].name === '_to') {
                    transferTo = params[i].value;
                }
                if (params[i].name === '_value') {
                    transferValue = params[i].value;
                }
            }
            return {
                to: transferTo,
                value: transferValue
            };
        }
        else {
            return {
                to: '',
                value: 0
            };
        }
    };
    TokenClient.prototype.decodeMethod = function (data) {
        var methodID = data.slice(2, 10);
        var abiItem = this.methodIDs[methodID];
        if (abiItem) {
            var params = abiItem.inputs.map(function (item) { return item.type; });
            var decoded = SolidityCoder.decodeParams(params, data.slice(10));
            return {
                name: abiItem.name,
                params: decoded.map(function (param, index) {
                    var parsedParam = param;
                    if (abiItem.inputs[index].type.indexOf("uint") !== -1) {
                        parsedParam = new Web3().toBigNumber(param).toString();
                    }
                    return {
                        name: abiItem.inputs[index].name,
                        value: parsedParam,
                        type: abiItem.inputs[index].type
                    };
                })
            };
        }
    };
    TokenClient.prototype.addAbi = function (abiArray) {
        var _this = this;
        if (Array.isArray(abiArray)) {
            abiArray.map(function (abi) {
                if (abi.name) {
                    var signature = new Web3().sha3(abi.name + "(" + abi.inputs.map(function (input) { return input.type; }).join(",") + ")");
                    if (abi.type == "event") {
                        _this.methodIDs[signature.slice(2)] = abi;
                    }
                    else {
                        _this.methodIDs[signature.slice(2, 10)] = abi;
                    }
                }
            });
            return abiArray;
        }
        else {
            throw new Error("Expected ABI array, got " + typeof abiArray);
        }
    };
    return TokenClient;
}());
exports.TokenClient = TokenClient;
//# sourceMappingURL=token-client.js.map