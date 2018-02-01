"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gethServer_1 = require("./gethServer");
var child_process = require('child_process');
var fs = require('fs');
var GethLab = /** @class */ (function () {
    function GethLab(config, client, server) {
        if (server === void 0) { server = new gethServer_1.GethServer(); }
        this.defaultAddress = '';
        this.config = config;
        this.client = client;
        this.server = server;
    }
    GethLab.prototype.getSweepAddress = function () {
        throw new Error('Not implemented.');
        // return this.config.ethereum.sweepAddress
    };
    GethLab.prototype.start = function () {
        return this.server.start();
    };
    GethLab.prototype.stop = function () {
        return this.server.stop();
    };
    GethLab.prototype.reset = function () {
        var _this = this;
        // return this.deleteWallet()
        return this.stop()
            .then(function () { return _this.start(); });
    };
    GethLab.prototype.send = function (address, amount) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.send('', address, amount)
                .then(function (result) { return console.log(result); })
                .catch(function (error) { return console.log(error); });
        });
    };
    GethLab.prototype.generate = function (blockCount) {
        return Promise.resolve();
    };
    return GethLab;
}());
exports.GethLab = GethLab;
//# sourceMappingURL=gethLab.js.map