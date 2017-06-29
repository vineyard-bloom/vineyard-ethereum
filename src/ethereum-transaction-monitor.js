"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promise_each2_1 = require("promise-each2");
var EthereumTransactionMonitor = (function () {
    function EthereumTransactionMonitor(model, ethereumClient, sweepAddress) {
        this.minimumConfirmations = 2;
        this.manager = model;
        this.ethereumClient = ethereumClient;
        this.sweepAddress = sweepAddress;
    }
    EthereumTransactionMonitor.prototype.saveNewTransaction = function (address) {
        var _this = this;
        return this.ethereumClient.getBalance(address)
            .then(function (balance) {
            return _this.ethereumClient.send(address, _this.sweepAddress, balance)
                .then(function (transaction) { return _this.manager.saveTransaction(transaction); });
        });
    };
    EthereumTransactionMonitor.prototype.sweep = function () {
        var _this = this;
        return this.manager.getAddresses()
            .then(function (addresses) { return promise_each2_1.each(addresses, function (address) { return _this.saveNewTransaction(address); }); });
    };
    return EthereumTransactionMonitor;
}());
exports.EthereumTransactionMonitor = EthereumTransactionMonitor;
//# sourceMappingURL=ethereum-transaction-monitor.js.map