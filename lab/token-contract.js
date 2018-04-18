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
var contract = require('truffle-contract');
// this is SALT smart contract - artifact of running truffle-compile
var saltCompiledContract = require('../test/res/compiled-salt-contract.json');
var TokenContract = /** @class */ (function () {
    function TokenContract(client, abi) {
        this.client = client;
        this.web3 = client.getWeb3();
        // TODO run truffle compile to build contract abi
        this.rawCompiledContract = saltCompiledContract;
        this.abi = abi ? abi : this.rawCompiledContract.abi;
        // this is for deploying a contract locally in test environment
        this.contract = contract(this.rawCompiledContract);
        this.contract.setProvider(this.web3.currentProvider || 'https://localhost:8545');
    }
    TokenContract.prototype.compileContract = function (source) {
        // deprecated
        return this.web3.eth.compile.solidity(source);
    };
    TokenContract.prototype.getContract = function (abi) {
        return Promise.resolve(this.web3.eth.contract(abi));
    };
    // this is for unit testing
    TokenContract.prototype.loadContract = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var instance, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.unlockAccount(address)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.contract.new({ from: address, gas: 4712388 })];
                    case 3:
                        instance = _a.sent();
                        return [2 /*return*/, instance];
                    case 4:
                        err_1 = _a.sent();
                        console.error('Error loading contract: ', err_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    TokenContract.prototype.getTotalSupply = function (abi, address) {
        return this.getContract(abi)
            .then(function (contract) {
            return Promise.resolve(contract.at(address))
                .then(function (instance) {
                return instance.totalSupply.call();
            });
        });
    };
    TokenContract.prototype.getData = function (abi, address, from) {
        return this.getContract(abi)
            .then(function (contract) {
            return Promise.resolve(contract.at(address))
                .then(function (instance) {
                return instance.balanceOf.getData(from);
            });
        });
    };
    TokenContract.prototype.getBalanceOf = function (abi, address, from) {
        // address = token contract address
        // func = token contract method to call
        return this.getContract(abi)
            .then(function (contract) {
            return Promise.resolve(contract.at(address))
                .then(function (instance) {
                // last param is total tx object
                return Promise.resolve(instance.balanceOf.call(from)); // balanceOf is contract specific, make dynamic
            })
                .catch(function (e) {
                console.error('Error getting balance of: ', e.message);
            });
        });
    };
    TokenContract.prototype.transfer = function (abi, address, from, to, value) {
        // address = token contract address
        return this.getContract(abi)
            .then(function (contract) {
            return Promise.resolve(contract.at(address))
                .then(function (instance) {
                // this.watchContract(instance, from)
                return Promise.resolve(instance.transfer.sendTransaction(to, value, { from: from, gas: 4712388 }))
                    .then(function (result) {
                    console.log('Token transfer success:', result);
                    return result;
                }).catch(function (e) {
                    console.error('Token transfer error: ', e.message);
                });
            });
        });
    };
    TokenContract.prototype.getTransactionReceipt = function (hash) {
        return Promise.resolve(this.web3.eth.getTransactionReceipt(hash))
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            console.error(e);
        });
    };
    TokenContract.prototype.watchContract = function (instance, from) {
        var myEvent = instance.Transfer({ from: from }, { fromBlock: 0, toBlock: 'latest' });
        myEvent.watch(function (error, result) {
            console.log('watch results: ', result);
        });
        // const myResults = myEvent.get(function(error, logs){})
    };
    // TODO deploy contract with truffle from in here for easy onboarding
    // different approach with truffle-contract directly - not working
    TokenContract.prototype.setupContract = function (abi, address, func, from) {
        var params = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            params[_i - 4] = arguments[_i];
        }
        var newContract = contract(abi);
        newContract.setProvider(this.client);
        newContract.deployed()
            .then(function (instance) {
            // last param is total tx object
            return (_a = instance.func).sendTransaction.apply(_a, params.concat([{ from: from }])).then(function (result) {
                console.log(result);
            });
            var _a;
        });
    };
    return TokenContract;
}());
exports.TokenContract = TokenContract;
