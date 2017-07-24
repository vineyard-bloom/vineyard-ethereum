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
    Broom.prototype.calculateSendAmount = function (amount) {
        return amount - (this.sweepGas * 21000);
    };
    Broom.prototype.saveSweepRecord = function (txHash) {
        var _this = this;
        return this.client.getClient().getTransaction(txHash)
            .then(function (transaction) {
            return _this.manager.saveSweepRecord(transaction)
                .then(function () { return _this.manager.saveTransaction(transaction); });
        })
            .catch(function (err) { return err; });
    };
    Broom.prototype.singleSweep = function (address) {
        var _this = this;
        return this.client.getBalance(address)
            .then(function (balance) {
            if (balance > _this.minSweepAmount) {
                return _this.client.send(address, _this.sweepAddress, _this.calculateSendAmount)
                    .then(function (txHash) { return _this.saveSweepRecord(txHash); });
            }
        })
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