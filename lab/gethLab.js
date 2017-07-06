"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gethServer_1 = require("./gethServer");
var child_process = require('child_process');
var fs = require('fs');
var rimraf = require('rimraf');
var GethLab = (function () {
    function GethLab(config, client, server) {
        if (server === void 0) { server = new gethServer_1.GethServer(); }
        this.config = config;
        this.client = client;
        this.server = server;
    }
    GethLab.prototype.start = function () {
        return this.server.start();
    };
    GethLab.prototype.stop = function () {
        return this.server.stop();
    };
    GethLab.prototype.reset = function () {
        return this.deleteWallet();
        // return this.stop()
        // .then(() => this.deleteWallet())
        // .then(() => this.start())
    };
    GethLab.prototype.generate = function (blockCount) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.getClient().generate(blockCount, function (error) {
                if (error)
                    reject(new Error(error));
                else
                    resolve();
            });
        });
    };
    GethLab.prototype.send = function (address, amount) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.getClient().send(defaultAddress, address, amount)
                .then(function (result) { return console.log(result); })
                .catch(function (error) { return console.log(error); });
        });
    };
    return GethLab;
}());
exports.GethLab = GethLab;
//# sourceMappingURL=gethLab.js.map