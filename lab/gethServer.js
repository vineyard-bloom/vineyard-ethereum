"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process = require('child_process');
var Status;
(function (Status) {
    Status[Status["inactive"] = 0] = "inactive";
    Status[Status["active"] = 1] = "active";
})(Status || (Status = {}));
function waitUntilRunning() {
    return new Promise(function (resolve, reject) {
        var poll = function () {
            console.log('Geth is now running');
            resolve();
        };
        setTimeout(poll, 10000);
    });
}
var GethServer = (function () {
    function GethServer() {
        this.status = Status.inactive;
    }
    GethServer.prototype.start = function () {
        console.log('Starting Geth');
        // const childProcess = this.childProcess = child_process.exec('geth --datadir=~/myBlockchain/node1 --networkid 100 --identity node1 --rpc --rpcport 8545 --rpcapi=\"db,eth,net,web3,personal,web3\" --keystore ./keystores console')
        var childProcess = this.childProcess = child_process.exec('node scripts/all');
        childProcess.stdout.on('data', function (data) {
            console.log("stdout: " + data);
        });
        childProcess.stderr.on('data', function (data) {
            console.error("stderr: " + data);
        });
        childProcess.on('close', function (code) {
            console.log("child process exited with code " + code);
        });
        return waitUntilRunning();
    };
    GethServer.prototype.stop = function () {
        var _this = this;
        if (!this.childProcess)
            return Promise.resolve();
        return new Promise(function (resolve, reject) {
            _this.childProcess.kill();
            _this.childProcess.on('close', function (code) {
                resolve();
            });
        });
    };
    return GethServer;
}());
exports.GethServer = GethServer;
//# sourceMappingURL=gethServer.js.map