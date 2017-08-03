"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promise_each2_1 = require("promise-each2");
var bignumber_js_1 = require("bignumber.js");
function gweiToWei(amount) {
    return amount.times("1000000000");
}
exports.gweiToWei = gweiToWei;
var Broom = (function () {
    function Broom(config, ethereumManager, ethereumClient) {
        this.config = config;
        this.manager = ethereumManager;
        this.client = ethereumClient;
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
    return Broom;
}());
exports.Broom = Broom;
//# sourceMappingURL=sweep.js.map