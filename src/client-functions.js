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
var vineyard_blockchain_1 = require("vineyard-blockchain");
function unlockWeb3Account(web3, address) {
    return new Promise(function (resolve, reject) {
        try {
            web3.personal.unlockAccount(address, function (err, result) {
                if (err) {
                    reject(new Error('Error unlocking account: ' + err.message));
                }
                else {
                    resolve(result);
                }
            });
        }
        catch (error) {
            reject(new Error('Error unlocking account: ' + address + '.  ' + error.message));
        }
    });
}
exports.unlockWeb3Account = unlockWeb3Account;
function sendWeb3Transaction(web3, transaction) {
    if (!transaction.from) {
        throw Error('Ethereum transaction.from cannot be empty.');
    }
    if (!transaction.to) {
        throw Error('Ethereum transaction.to cannot be empty.');
    }
    return unlockWeb3Account(web3, transaction.from)
        .then(function () {
        return new Promise(function (resolve, reject) {
            web3.eth.sendTransaction(transaction, function (err, txid) {
                if (err) {
                    console.log('Error sending (original)', transaction);
                    reject('Error sending to ' + transaction.to + ': ' + err);
                }
                else {
                    var txInfo = web3.eth.getTransaction(txid);
                    console.log('Sent Ethereum transaction', txid, txInfo);
                    var transactionResult = Object.assign({}, transaction, {
                        hash: txid,
                        gasPrice: txInfo.gasPrice,
                        gas: txInfo.gas
                    });
                    resolve(transactionResult);
                }
            });
        });
    });
}
exports.sendWeb3Transaction = sendWeb3Transaction;
function getBlock(web3, blockIndex) {
    return new Promise(function (resolve, reject) {
        web3.eth.getBlock(blockIndex, true, function (err, block) {
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
exports.getBlock = getBlock;
function getBlockIndex(web3) {
    return new Promise(function (resolve, reject) {
        web3.eth.getBlockNumber(function (err, blockNumber) {
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
exports.getBlockIndex = getBlockIndex;
function getLastBlock(web3) {
    return __awaiter(this, void 0, void 0, function () {
        var lastBlock, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = getBlock;
                    _b = [web3];
                    return [4 /*yield*/, getBlockIndex(web3)];
                case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.sent()]))];
                case 2:
                    lastBlock = _c.sent();
                    return [2 /*return*/, {
                            hash: lastBlock.hash,
                            index: lastBlock.number,
                            timeMined: new Date(lastBlock.timestamp * 1000),
                            currency: 2
                        }];
            }
        });
    });
}
exports.getLastBlock = getLastBlock;
function getTransactionReceipt(web3, txid) {
    return new Promise(function (resolve, reject) {
        web3.eth.getTransactionReceipt(txid, function (err, transaction) {
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
exports.getTransactionReceipt = getTransactionReceipt;
function getTransactionStatus(web3, txid) {
    return __awaiter(this, void 0, void 0, function () {
        var transactionReceipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTransactionReceipt(web3, txid)];
                case 1:
                    transactionReceipt = _a.sent();
                    return [2 /*return*/, transactionReceipt.status.substring(2) === '0' ? vineyard_blockchain_1.TransactionStatus.rejected : vineyard_blockchain_1.TransactionStatus.accepted];
            }
        });
    });
}
exports.getTransactionStatus = getTransactionStatus;
function getNextBlockInfo(web3, previousBlock) {
    return __awaiter(this, void 0, void 0, function () {
        var nextBlockIndex, nextBlock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nextBlockIndex = previousBlock ? previousBlock.index + 1 : 0;
                    return [4 /*yield*/, getBlock(web3, nextBlockIndex)];
                case 1:
                    nextBlock = _a.sent();
                    if (!nextBlock) {
                        return [2 /*return*/, undefined];
                    }
                    return [2 /*return*/, {
                            hash: nextBlock.hash,
                            index: nextBlock.number,
                            timeMined: new Date(nextBlock.timestamp * 1000),
                            currency: 2
                        }];
            }
        });
    });
}
exports.getNextBlockInfo = getNextBlockInfo;
function convertStatus(gethStatus) {
    switch (gethStatus) {
        case 'pending':
            return vineyard_blockchain_1.TransactionStatus.pending;
        case 'accepted':
            return vineyard_blockchain_1.TransactionStatus.accepted;
        case 'rejected':
            return vineyard_blockchain_1.TransactionStatus.rejected;
        default:
            return vineyard_blockchain_1.TransactionStatus.unknown;
    }
}
exports.convertStatus = convertStatus;
function getFullBlock(web3, blockIndex) {
    return __awaiter(this, void 0, void 0, function () {
        var block, blockHeight, transactions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getBlock(web3, blockIndex)];
                case 1:
                    block = _a.sent();
                    return [4 /*yield*/, getBlockIndex(web3)];
                case 2:
                    blockHeight = _a.sent();
                    transactions = block.transactions.map(function (t) { return ({
                        txid: t.hash,
                        to: t.to,
                        from: t.from,
                        amount: t.value,
                        timeReceived: new Date(block.timestamp * 1000),
                        confirmations: blockHeight - blockIndex,
                        status: convertStatus(t.status),
                        blockIndex: blockIndex
                    }); });
                    return [2 /*return*/, {
                            index: blockIndex,
                            hash: block.hash,
                            timeMined: new Date(block.timestamp * 1000),
                            transactions: transactions
                        }];
            }
        });
    });
}
exports.getFullBlock = getFullBlock;
//# sourceMappingURL=client-functions.js.map