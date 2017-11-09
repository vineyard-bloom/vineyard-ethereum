"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promise_each2_1 = require("promise-each2");
var bignumber_js_1 = require("bignumber.js");
var token_contract_1 = require("../lab/token-contract");
function gweiToWei(amount) {
    return amount.times("1000000000");
}
exports.gweiToWei = gweiToWei;
var Broom = (function () {
    function Broom(config, ethereumManager, ethereumClient) {
        this.config = config;
        this.manager = ethereumManager;
        this.client = ethereumClient;
        this.tokenContract = new token_contract_1.TokenContract(this.client);
    }
    Broom.prototype.singleSweep = function (address) {
        var _this = this;
        return this.client.getBalance(address)
            .then(function (balance) {
            if (balance.greaterThan(_this.config.minSweepAmount)) {
                var sendAmount_1 = _this.calculateSendAmount(balance);
                var transaction = {
                    from: address,
                    to: _this.config.sweepAddress,
                    value: sendAmount_1,
                    gas: _this.config.gas,
                    gasPrice: _this.config.gasPrice,
                };
                console.log('Sweeping address', transaction);
                return _this.client.send(transaction)
                    .then(function (tx) {
                    console.log('Sweeping address succeeded', tx.hash);
                    return _this.saveSweepRecord({
                        from: address,
                        to: _this.config.sweepAddress,
                        status: 0,
                        txid: tx.hash,
                        amount: sendAmount_1
                    });
                });
            }
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
        return this.manager.getDustyAddresses()
            .then(function (addresses) {
            console.log('Dusty addresses', addresses.length, addresses);
            return promise_each2_1.each(addresses, function (address) { return _this.tokenSingleSweep(abi, address); });
        })
            .then(function () { return console.log('Finished Token sweep'); });
    };
    Broom.prototype.tokenSingleSweep = function (abi, address) {
        var _this = this;
        return this.client.unlockAccount(address)
            .then(function () { return _this.tokenContract.getBalanceOf(abi, _this.config.tokenContractAddress, address)
            .then(function (balance) {
            console.log('Sweeping address', address);
            return _this.tokenContract.transfer(abi, _this.config.tokenContractAddress, address, _this.config.sweepAddress, balance.c[0])
                .then(function (tx) {
                console.log('Sweeping address succeeded', tx.hash);
                return _this.saveSweepRecord({
                    from: address,
                    to: _this.config.sweepAddress,
                    status: 0,
                    txid: tx.hash,
                    amount: balance
                });
            });
        }); });
    };
    Broom.prototype.needsGas = function (abi, address) {
        var _this = this;
        return this.client.unlockAccount(address)
            .then(function () { return _this.tokenContract.getBalanceOf(abi, _this.config.tokenContractAddress, address)
            .then(function (tokenBalance) { return _this.client.getBalance(address)
            .then(function (ethBalance) { return parseFloat(tokenBalance) > 0 && ethBalance.toNumber() < 300000000000000; }); }); });
    };
    Broom.prototype.gasTransaction = function (abi, address) {
        var _this = this;
        var readableAddress = address.slice(2);
        var readableHotWallet = this.config.hotWalletAddress.slice(2);
        return this.needsGas(abi, address)
            .then(function (gasLess) {
            if (gasLess) {
                return _this.client.send(readableHotWallet, readableAddress, 0.0003);
            }
        });
    };
    Broom.prototype.provideGas = function (abi) {
        var _this = this;
        console.log('Starting Salt Gas Provider');
        return this.manager.getDustyAddresses()
            .then(function (addresses) {
            console.log('Dusty addresses', addresses.length, addresses);
            return promise_each2_1.each(addresses, function (address) { return _this.gasTransaction(abi, address); });
        })
            .then(function () { return console.log('Finished Salt Gas Provider job'); });
    };
    return Broom;
}());
exports.Broom = Broom;
//# sourceMappingURL=sweep.js.map