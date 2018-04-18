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
var client_functions_1 = require("./client-functions");
var utility_1 = require("./utility");
var Web3 = require('web3');
var SolidityCoder = require('web3/lib/solidity/coder.js');
var TokenClient = /** @class */ (function () {
    function TokenClient(ethereumConfig, currency, tokenContractAddress, abi, web3) {
        this.methodIDs = {};
        this.web3 = utility_1.initializeWeb3(ethereumConfig, web3);
        this.tokenContractAddress = tokenContractAddress;
        this.currency = currency;
        this.abi = this.addAbi(abi);
    }
    TokenClient.prototype.send = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, client_functions_1.sendWeb3Transaction(this.web3, transaction)];
            });
        });
    };
    TokenClient.prototype.getBlockIndex = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, client_functions_1.getBlockIndex(this.web3)];
            });
        });
    };
    TokenClient.prototype.getLastBlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, client_functions_1.getLastBlock(this.web3)];
            });
        });
    };
    TokenClient.prototype.getTransactionStatus = function (txid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, client_functions_1.getTransactionStatus(this.web3, txid)];
            });
        });
    };
    TokenClient.prototype.getNextBlockInfo = function (previousBlock) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, client_functions_1.getNextBlockInfo(this.web3, previousBlock)];
            });
        });
    };
    TokenClient.prototype.getFullBlock = function (blockInfo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, client_functions_1.getFullBlock(this.web3, blockInfo.index)];
            });
        });
    };
    TokenClient.prototype.getBlock = function (blockIndex) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, client_functions_1.getBlock(this.web3, blockIndex)];
            });
        });
    };
    TokenClient.prototype.getTransactionReceipt = function (txid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, client_functions_1.getTransactionReceipt(this.web3, txid)];
            });
        });
    };
    TokenClient.prototype.addAbi = function (abiArray) {
        var _this = this;
        if (Array.isArray(abiArray)) {
            abiArray.map(function (abi) {
                if (abi.name) {
                    var signature = new Web3().sha3(abi.name + '(' + abi.inputs.map(function (input) {
                        return input.type;
                    }).join(',') + ')');
                    if (abi.type === 'event') {
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
            throw new Error('Expected ABI array, got ' + typeof abiArray);
        }
    };
    return TokenClient;
}());
exports.TokenClient = TokenClient;
