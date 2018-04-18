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
var utility_1 = require("./utility");
var Web3 = require('web3');
var SolidityFunction = require('web3/lib/web3/function');
var SolidityEvent = require('web3/lib/web3/event');
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
                // console.error('Error processing ethereum block', blockIndex, 'with message', err.message)
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
                // console.error('Error processing ethereum block number', blockNumber, 'with message', err.message)
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
                            timeMined: new Date(lastBlock.timestamp * 1000)
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
                // console.error('Error querying transaction', txid, 'with message', err.message)
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
                    return [2 /*return*/, transactionReceipt.status.substring(2) === '0' ? vineyard_blockchain_1.blockchain.TransactionStatus.rejected : vineyard_blockchain_1.blockchain.TransactionStatus.accepted];
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
                            timeMined: new Date(nextBlock.timestamp * 1000)
                        }];
            }
        });
    });
}
exports.getNextBlockInfo = getNextBlockInfo;
function convertStatus(gethStatus) {
    switch (gethStatus) {
        case 'pending':
            return vineyard_blockchain_1.blockchain.TransactionStatus.pending;
        case 'accepted':
            return vineyard_blockchain_1.blockchain.TransactionStatus.accepted;
        case 'rejected':
            return vineyard_blockchain_1.blockchain.TransactionStatus.rejected;
        default:
            return vineyard_blockchain_1.blockchain.TransactionStatus.unknown;
    }
}
exports.convertStatus = convertStatus;
exports.toChecksumAddress = Web3.prototype.toChecksumAddress;
function getNullableChecksumAddress(address) {
    return typeof address === 'string'
        ? Web3.prototype.toChecksumAddress(address)
        : undefined;
}
exports.getNullableChecksumAddress = getNullableChecksumAddress;
var erc20GroupedAbi = require('./abi/erc20-grouped.json');
var erc20AttributesAbi = erc20GroupedAbi.attributes;
var erc20BalanceAbi = erc20GroupedAbi.balance;
var erc20TransferEventAbi = erc20GroupedAbi.events.filter(function (e) { return e.name == 'Transfer'; })[0];
var erc20ReadonlyAbi = erc20AttributesAbi.concat(erc20BalanceAbi);
function checkContractMethod(contract, methodName, args) {
    if (args === void 0) { args = []; }
    var method = contract[methodName];
    var payload = method.toPayload(args);
    var defaultBlock = method.extractDefaultBlock(args);
    return new Promise(function (resolve, reject) {
        method._eth.call(payload, defaultBlock, function (error, output) {
            if (error) {
                reject(false);
            }
            else {
                resolve(output !== '0x');
            }
        });
    });
}
exports.checkContractMethod = checkContractMethod;
function callContractMethod(contract, methodName, args) {
    if (args === void 0) { args = []; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var handler = function (err, blockNumber) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(blockNumber);
                        }
                    };
                    var method = contract[methodName];
                    method.call.apply(method, args.concat(handler));
                })];
        });
    });
}
exports.callContractMethod = callContractMethod;
function callCheckedContractMethod(contract, methodName, args) {
    if (args === void 0) { args = []; }
    return __awaiter(this, void 0, void 0, function () {
        var exists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, checkContractMethod(contract, methodName, args)];
                case 1:
                    exists = _a.sent();
                    if (!exists)
                        return [2 /*return*/, undefined];
                    return [2 /*return*/, callContractMethod(contract, methodName, args)];
            }
        });
    });
}
exports.callCheckedContractMethod = callCheckedContractMethod;
function createContract(eth, abi, address) {
    var result = {};
    for (var _i = 0, abi_1 = abi; _i < abi_1.length; _i++) {
        var method = abi_1[_i];
        result[method.name] = new SolidityFunction(eth, method, address);
    }
    return result;
}
exports.createContract = createContract;
function getTokenContractFromReceipt(web3, receipt) {
    return __awaiter(this, void 0, void 0, function () {
        var address, contract, result, _i, erc20AttributesAbi_1, method, value, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    address = receipt.contractAddress;
                    contract = createContract(web3.eth, erc20AttributesAbi, address);
                    result = {
                        contractType: vineyard_blockchain_1.blockchain.ContractType.token,
                        address: address,
                        txid: receipt.transactionHash
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    _i = 0, erc20AttributesAbi_1 = erc20AttributesAbi;
                    _a.label = 2;
                case 2:
                    if (!(_i < erc20AttributesAbi_1.length)) return [3 /*break*/, 5];
                    method = erc20AttributesAbi_1[_i];
                    return [4 /*yield*/, callCheckedContractMethod(contract, method.name)];
                case 3:
                    value = _a.sent();
                    if (value === undefined)
                        return [2 /*return*/, {
                                contractType: vineyard_blockchain_1.blockchain.ContractType.unknown,
                                address: address,
                                txid: receipt.transactionHash
                            }];
                    result[method.name] = value;
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, result];
                case 6:
                    error_1 = _a.sent();
                    return [2 /*return*/, undefined];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.getTokenContractFromReceipt = getTokenContractFromReceipt;
var transferEvent = new SolidityEvent(undefined, erc20TransferEventAbi, '');
function getBlockContractTransfers(web3, filter) {
    return __awaiter(this, void 0, void 0, function () {
        var events, decoded;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, utility_1.getEvents(web3, filter)];
                case 1:
                    events = _a.sent();
                    decoded = events.map(function (e) { return transferEvent.decode(e); });
                    return [2 /*return*/, decoded
                        // return decoded.map(d => ({
                        //   to: d.args._to,
                        //   from: d.args._from,
                        //   amount: d.args._value,
                        //   txid: d.transactionHash,
                        //   contractAddress: d.address,
                        //   blockIndex: d.blockNumber
                        // }))
                    ];
            }
        });
    });
}
exports.getBlockContractTransfers = getBlockContractTransfers;
function decodeTokenTransfer(event) {
    var result = transferEvent.decode(event);
    result.args = {
        to: exports.toChecksumAddress(result.args._to),
        from: exports.toChecksumAddress(result.args._from),
        value: result.args._value
    };
    return result;
}
exports.decodeTokenTransfer = decodeTokenTransfer;
function mapTransactionEvents(events, txid) {
    return events.filter(function (c) { return c.transactionHash == txid; });
}
exports.mapTransactionEvents = mapTransactionEvents;
function loadTransaction(web3, tx, block, events) {
    return __awaiter(this, void 0, void 0, function () {
        var receipt, contract, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getTransactionReceipt(web3, tx.hash)];
                case 1:
                    receipt = _b.sent();
                    if (!receipt.contractAddress) return [3 /*break*/, 3];
                    return [4 /*yield*/, getTokenContractFromReceipt(web3, receipt)];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = undefined;
                    _b.label = 4;
                case 4:
                    contract = _a;
                    return [2 /*return*/, {
                            txid: tx.hash,
                            to: getNullableChecksumAddress(tx.to),
                            from: getNullableChecksumAddress(tx.from),
                            amount: tx.value,
                            timeReceived: new Date(block.timestamp * 1000),
                            status: convertStatus(tx.status),
                            blockIndex: block.number,
                            gasUsed: receipt.gasUsed,
                            gasPrice: tx.gasPrice,
                            fee: tx.gasPrice.times(receipt.gasUsed),
                            newContract: contract,
                            events: mapTransactionEvents(events, tx.hash),
                            nonce: tx.nonce
                        }];
            }
        });
    });
}
exports.loadTransaction = loadTransaction;
function partitionArray(partitionSize, items) {
    var result = [];
    for (var i = 0; i < items.length; i += partitionSize) {
        result.push(items.slice(i, i + partitionSize));
    }
    return result;
}
exports.partitionArray = partitionArray;
function partitionedMap(partitionSize, action, items) {
    return __awaiter(this, void 0, void 0, function () {
        var groups, result, _i, groups_1, group, promises, newItems;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    groups = partitionArray(partitionSize, items);
                    result = [];
                    _i = 0, groups_1 = groups;
                    _a.label = 1;
                case 1:
                    if (!(_i < groups_1.length)) return [3 /*break*/, 4];
                    group = groups_1[_i];
                    promises = group.map(action);
                    return [4 /*yield*/, Promise.all(promises)];
                case 2:
                    newItems = _a.sent();
                    result = result.concat(newItems);
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
exports.partitionedMap = partitionedMap;
function getFullBlock(web3, blockIndex) {
    return __awaiter(this, void 0, void 0, function () {
        var block, events, _i, events_1, event_1, transactions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getBlock(web3, blockIndex)];
                case 1:
                    block = _a.sent();
                    return [4 /*yield*/, utility_1.getEvents(web3, {
                            toBlock: blockIndex,
                            fromBlock: blockIndex,
                        })];
                case 2:
                    events = _a.sent();
                    for (_i = 0, events_1 = events; _i < events_1.length; _i++) {
                        event_1 = events_1[_i];
                        event_1.address = exports.toChecksumAddress(event_1.address);
                    }
                    return [4 /*yield*/, partitionedMap(10, function (tx) { return loadTransaction(web3, tx, block, events); }, block.transactions)
                        // console.log('Loaded', block.transactions.length, 'transactions for block', blockIndex)
                    ];
                case 3:
                    transactions = _a.sent();
                    // console.log('Loaded', block.transactions.length, 'transactions for block', blockIndex)
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
