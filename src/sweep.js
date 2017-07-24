"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promise_each2_1 = require("promise-each2");
var Broom = (function () {
    function Broom(ethereumConfig, ethereumManager, ethereumClient) {
        this.minSweepAmount = ethereumConfig.minSweepAmount;
        this.sweepAddress = ethereumConfig.sweepAddress;
        this.manager = ethereumManager;
        this.client = ethereumClient;
    }
    Broom.prototype.getSweepGas = function () {
        var _this = this;
        return this.client.getGas()
            .then(function (gasPrice) { return _this.sweepGas = gasPrice; })
            .catch(function (err) { return err; });
    };
    Broom.prototype.singleSweep = function (address) {
        var _this = this;
        return this.client.getBalance(address)
            .then(function (balance) {
            if (balance > _this.minSweepAmount) {
                var sendAmount_1 = _this.calculateSendAmount();
                return _this.client.send(address, _this.sweepAddress, sendAmount_1)
                    .then(function (txHash) { return _this.saveSweepRecord({
                    from: address,
                    to: _this.sweepAddress,
                    status: 0,
                    txid: txHash,
                    amount: sendAmount_1
                }); });
            }
        })
            .catch(function (err) { return err; });
    };
    Broom.prototype.calculateSendAmount = function (amount) {
        return amount - (this.sweepGas * 21000);
    };
    Broom.prototype.saveSweepRecord = function (bristle) {
        var _this = this;
        return this.manager.saveSweepRecord(bristle)
            .then(function () { return _this.manager.saveTransaction(bristle); })
            .catch(function (err) { return err; });
    };
    Broom.prototype.sweep = function () {
        var _this = this;
        return this.getSweepGas()
            .then(function () {
            return _this.manager.getAddresses()
                .then(function (addresses) { return promise_each2_1.each(addresses, function (address) { return _this.singleSweep(address); }); });
        });
    };
    return Broom;
}());
exports.Broom = Broom;
//# sourceMappingURL=sweep.js.map