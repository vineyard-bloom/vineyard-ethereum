"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promise_each2_1 = require("promise-each2");
var bignumber_js_1 = require("bignumber.js");
function gweiToWei(amount) {
    return amount.dividedBy("1000000000");
}
exports.gweiToWei = gweiToWei;
var Broom = (function () {
    function Broom(config, ethereumManager, ethereumClient) {
        this.config = config;
        this.manager = ethereumManager;
        this.client = ethereumClient;
        this.config.gasPrice = ethereumClient.getWeb3().gasPrice;
    }
    Broom.prototype.singleSweep = function (address) {
        var _this = this;
        return this.client.getBalance(address)
            .then(function (balance) {
            if (balance.greaterThan(_this.config.minSweepAmount)) {
                var sendAmount = _this.calculateSendAmount(balance)
                    .then(function (sendAmount) {
                    return _this.client.send(address, _this.client.sweepAddress, sendAmount)
                        .then(function (txHash) {
                        console.log('Saving sweep: ', txHash);
                        return _this.saveSweepRecord({
                            from: address,
                            to: _this.client.sweepAddress,
                            status: 0,
                            txid: txHash,
                            amount: sendAmount
                        });
                    });
                });
            }
        });
    };
    Broom.prototype.calculateSendAmount = function (amount) {
        var gasPrice = gweiToWei(new bignumber_js_1.default(this.config.gasPrice));
        var gasTotal = new bignumber_js_1.default(this.config.gas).times(gasPrice);
        return amount.subtract(gasTotal);
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