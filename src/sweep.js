"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promise_each2_1 = require("promise-each2");
var bignumber_js_1 = require("bignumber.js");
var token_contract_1 = require("../lab/token-contract");
function gweiToWei(amount) {
    return amount.times("1000000000");
}
exports.gweiToWei = gweiToWei;
var Broom = /** @class */ (function () {
    function Broom(config, ethereumManager, ethereumClient) {
        this.config = config;
        this.manager = ethereumManager;
        this.client = ethereumClient;
        this.tokenContract = new token_contract_1.TokenContract(this.client);
    }
    Broom.prototype.singleSweep = function (address) {
        var _this = this;
        return this.manager.isAwaitingGas(address)
            .then(function (bool) {
            if (bool) {
                return Promise.resolve();
            }
            else {
                return _this.client.getBalance(address)
                    .then(function (balance) {
                    if (balance.greaterThan(_this.config.minSweepAmount)) {
                        return _this.sweepSendAndSave(balance, address);
                    }
                });
            }
        });
    };
    Broom.prototype.sweepSendAndSave = function (balance, address) {
        var _this = this;
        var sendAmount = this.calculateSendAmount(balance);
        var transaction = {
            from: address,
            to: this.config.sweepAddress,
            value: sendAmount,
            gas: this.config.gas,
            gasPrice: this.config.gasPrice,
        };
        console.log('Sweeping address', transaction);
        return this.client.send(transaction)
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
    };
    Broom.prototype.calculateSendAmount = function (amount) {
        var gasPrice = gweiToWei(new bignumber_js_1.default(this.config.gasPrice));
        var gasTotal = new bignumber_js_1.default(this.config.gas).times(gasPrice);
        return amount.minus(gasTotal);
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
        var _this = this;
        console.log('Starting Token sweep');
        return this.provideGas(abi)
            .then(function () { return _this.manager.getDustyAddresses()
            .then(function (addresses) {
            console.log('Dusty addresses', addresses.length, addresses);
            return promise_each2_1.each(addresses, function (address) { return _this.tokenSingleSweep(abi, address); });
        }); }).then(function () { return console.log('Finished Token sweep'); });
    };
    Broom.prototype.tokenSingleSweep = function (abi, address) {
        var _this = this;
        return this.client.unlockAccount(address)
            .then(function () { return _this.tokenContract.getBalanceOf(abi, _this.config.tokenContractAddress, address)
            .then(function (balance) {
            if (new bignumber_js_1.default(balance).toNumber() > 0) {
                console.log('Sweeping address', address);
                return _this.tokenContract.transfer(abi, _this.config.tokenContractAddress, address, _this.config.tokenSweepAddress, balance.toNumber())
                    .then(function (tx) {
                    console.log('Sweeping address succeeded', tx.hash);
                    return _this.saveSweepRecord({
                        from: address,
                        to: _this.config.tokenSweepAddress,
                        status: 1,
                        txid: tx.hash,
                        amount: balance
                    }).then(function () { return _this.manager.removeGasTransaction(address); });
                });
            }
        }); }).catch(function (err) { return console.error("Error sweeping address: " + address + ":\n " + err); });
    };
    Broom.prototype.needsGas = function (abi, address) {
        var _this = this;
        return this.manager.isAwaitingGas(address)
            .then(function (bool) {
            if (bool) {
                return false;
            }
            else {
                return _this.client.unlockAccount(address)
                    .then(function () { return _this.tokenContract.getBalanceOf(abi, _this.config.tokenContractAddress, address)
                    .then(function (tokenBalance) { return _this.client.getBalance(address)
                    .then(function (ethBalance) {
                    var gasPrice = _this.client.getWeb3().eth.gasPrice;
                    var totalGasEth = 60000 * parseFloat(gweiToWei(new bignumber_js_1.default(gasPrice)));
                    return new bignumber_js_1.default(tokenBalance).toNumber() > 0 && ethBalance.toNumber() < totalGasEth ? new bignumber_js_1.default(tokenBalance).toNumber() : false;
                }); }); });
            }
        });
    };
    Broom.prototype.gasTransaction = function (abi, address) {
        var _this = this;
        return this.needsGas(abi, address)
            .then(function (tokenBalance) {
            if (tokenBalance) {
                var gasPrice = _this.client.getWeb3().eth.gasPrice / 1000000000;
                var value = parseFloat(gweiToWei(new bignumber_js_1.default(gasPrice))) * 60000;
                var transaction = {
                    from: _this.config.hotWallet,
                    to: address,
                    gasPrice: gasPrice,
                    gas: _this.config.gas,
                    value: value
                };
                return _this.client.send(transaction)
                    .then(function (tx) { return _this.manager.saveGasTransaction(address, tx.hash); });
            }
        }).catch(function (err) { return console.error("Error providing gas at address: " + address + ":\n " + err); });
    };
    Broom.prototype.provideGas = function (abi) {
        var _this = this;
        console.log('Starting Salt Gas Provider');
        return this.client.unlockAccount(this.config.hotWallet)
            .then(function () { return _this.manager.getDustyAddresses()
            .then(function (addresses) {
            console.log('Dusty addresses', addresses.length, addresses);
            return promise_each2_1.each(addresses, function (address) {
                return _this.gasTransaction(abi, address);
            });
        }); });
    };
    return Broom;
}());
exports.Broom = Broom;
//# sourceMappingURL=sweep.js.map