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
var promise_each2_1 = require("promise-each2");
var bignumber_js_1 = require("bignumber.js");
var token_contract_1 = require("../lab/token-contract");
function gweiToWei(amount) {
    return amount.times('1000000000');
}
exports.gweiToWei = gweiToWei;
var Broom = /** @class */ (function () {
    function Broom(config, ethereumManager, ethereumClient) {
        this.config = config;
        this.manager = ethereumManager;
        this.client = ethereumClient;
        this.tokenContract = new token_contract_1.TokenContract(this.client);
        this.gasTotal = this.getTotalGas();
    }
    Broom.prototype.getTotalGas = function () {
        var totalGwei = (new bignumber_js_1.default(this.config.gas)).times(new bignumber_js_1.default(this.config.gasPrice));
        return totalGwei;
    };
    Broom.prototype.saveSweepRecord = function (bristle) {
        return this.manager.saveSweepRecord(bristle);
    };
    Broom.prototype.sweep = function () {
        var _this = this;
        console.log('Starting Ethereum sweep');
        return this.manager.getDustyAddresses()
            .then(function (addresses) {
            console.log('Dusty addresses', addresses.length, addresses);
            return promise_each2_1.each(addresses, function (address) { return _this.singleSweep(address); });
        })
            .then(function () { return console.log('Finished Ethereum sweep'); });
    };
    Broom.prototype.tokenSweep = function (abi) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Starting Token sweep');
                        return [4 /*yield*/, this.provideGas(abi)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.manager.getDustyAddresses()
                                .then(function (addresses) {
                                console.log('Dusty token addresses', addresses.length, addresses);
                                return promise_each2_1.each(addresses, function (address) { return _this.tokenSingleSweep(abi, address); });
                            })
                                .then(function () { return console.log('Finished Token sweep'); })];
                }
            });
        });
    };
    Broom.prototype.tokenSingleSweep = function (abi, address) {
        var _this = this;
        return this.tokenContract.getBalanceOf(abi, this.config.tokenContractAddress, address)
            .then(function (balance) {
            console.log('Sweeping address', address);
            return _this.client.unlockAccount(address).then(function () {
                return _this.tokenContract.transfer(abi, _this.config.tokenContractAddress, address, _this.config.sweepAddress, balance.toNumber())
                    .then(function (tx) {
                    console.log('Sweeping address succeeded', tx);
                    return _this.saveSweepRecord({
                        from: address,
                        to: _this.config.sweepAddress,
                        status: 0,
                        txid: tx,
                        amount: balance
                    });
                })
                    .catch(function (e) {
                    console.error('Error sweeping token: ', e.message);
                    return new Error(e);
                });
            })
                .catch(function (e) {
                console.error('Error getting token address balance: ', e.message);
                return new Error(e);
            });
        })
            .catch(function (e) {
            console.error('Error unlocking address in token sweep: ', e.message);
            return new Error(e);
        });
    };
    Broom.prototype.needsGas = function (abi, address) {
        var _this = this;
        return this.tokenContract.getBalanceOf(abi, this.config.tokenContractAddress, address)
            .then(function (tokenBalance) { return _this.client.getBalance(address)
            .then(function (ethBalance) { return parseFloat(tokenBalance) > 0 && ethBalance.toNumber() < 300000000000000; }); });
    };
    Broom.prototype.gasTransaction = function (abi, address) {
        var _this = this;
        return this.needsGas(abi, address)
            .then(function (gasLess) {
            if (gasLess && _this.config.hotWallet) {
                var tx = {
                    from: _this.config.hotWallet,
                    to: address,
                    value: _this.client.toWei(0.0003),
                    gas: _this.config.gas,
                    gasPrice: _this.config.gasPrice
                };
                return _this.client.sendTransaction(tx).then(function (result) {
                    _this.manager.saveGasTransaction({ address: result.to, txid: result.hash });
                });
            }
            else {
                Promise.resolve();
            }
        });
    };
    Broom.prototype.provideGas = function (abi) {
        var _this = this;
        console.log('Starting Token Gas Provider');
        return this.manager.getDustyAddresses()
            .then(function (addresses) {
            console.log('Dusty addresses', addresses.length, addresses);
            return promise_each2_1.each(addresses, function (address) { return _this.gasTransaction(abi, address); });
        })
            .then(function () { return console.log('Finished Token Gas Provider job'); });
    };
    Broom.prototype.singleSweep = function (address) {
        var _this = this;
        return this.client.getBalance(address)
            .then(function (balance) {
            var sendAmount = balance.minus(_this.gasTotal);
            if (sendAmount.greaterThan(_this.gasTotal)) {
                var transaction = {
                    from: address,
                    to: _this.config.sweepAddress,
                    value: sendAmount,
                    gas: _this.config.gas,
                    gasPrice: _this.config.gasPrice
                };
                console.log('Sweeping address', transaction);
                return _this.client.sendTransaction(transaction)
                    .then(function (tx) {
                    console.log('Sweeping address succeeded', tx.hash);
                    return _this.saveSweepRecord({
                        from: address,
                        to: _this.config.sweepAddress,
                        status: 0,
                        txid: tx.hash,
                        amount: sendAmount
                    });
                });
            }
            return Promise.resolve();
        });
    };
    return Broom;
}());
exports.Broom = Broom;
