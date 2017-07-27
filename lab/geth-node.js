"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Web3 = require("web3");
var child_process = require('child_process');
var Status;
(function (Status) {
    Status[Status["inactive"] = 0] = "inactive";
    Status[Status["active"] = 1] = "active";
})(Status || (Status = {}));
var GethNode = (function () {
    function GethNode() {
        this.status = Status.inactive;
        this.node = new Web3();
        this.node.setProvider(new this.node.providers.HttpProvider("http://localhost:8545/"));
    }
    GethNode.prototype.getClient = function () {
        return this.node;
    };
    GethNode.prototype.start = function () {
        console.log('Starting Geth');
        var childProcess = this.childProcess = child_process.exec('geth --dev  --verbosity 4  --rpc --rpcport 8545 --rpcapi=\"db,eth,net,web3,personal,web3\" --keystore ./keystores console');
        childProcess.stdout.on('data', function (data) {
            console.log("stdout: " + data);
        });
        childProcess.stderr.on('data', function (data) {
            console.error("stderr: " + data);
        });
        childProcess.on('close', function (code) {
            console.log("child process exited with code " + code);
        });
    };
    GethNode.prototype.stop = function () {
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
    return GethNode;
}());
exports.GethNode = GethNode;
//# sourceMappingURL=geth-node.js.map