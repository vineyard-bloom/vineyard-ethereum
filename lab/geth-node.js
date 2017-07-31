"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
var child_process = require('child_process');
var rimraf = require('rimraf');
var Status;
(function (Status) {
    Status[Status["inactive"] = 0] = "inactive";
    Status[Status["active"] = 1] = "active";
})(Status || (Status = {}));
// export class Miner {
//   private minerProcess
//   constructor() {
//   }
//   start(): Promise<void> {
//     return new Promise<void>((resolve, reject) => {
//      const minerProcess = this.minerProcess = child_process.exec(
//       gethPath + ' --dev --verbosity 4 --keystore ./temp/keystore'
//       + ' --datadir ' + datadir + ' --networkid 101 --mine --minerthreads 5 console'
//     ) 
//     })
//   }
// }
var GethNode = (function () {
    function GethNode(config) {
        this.status = Status.inactive;
        this.childProcess = null;
        this.config = config || {};
        // this.miner = new Miner()
        this.datadir = './temp/eth/geth' + GethNode.instanceIndex++;
    }
    GethNode.prototype.getWeb3 = function () {
        return this.client.getWeb3();
    };
    GethNode.prototype.getClient = function () {
        return this.client;
    };
    GethNode.prototype.startMiner = function (port) {
        return this.start(port, '--mine --minerthreads 5');
    };
    GethNode.prototype.start = function (port, flags) {
        if (flags === void 0) { flags = ''; }
        var gethPath = this.config.gethPath || 'geth';
        console.log('Starting Geth');
        var command = gethPath + ' --dev --rpc --verbosity 0 --rpcport ' + port
            + ' --rpcapi=\"db,eth,net,web3,personal,miner,web3\" --keystore ./temp/eth/keystore'
            + ' --datadir ' + this.datadir + ' --networkid 101 ' + flags + ' console';
        console.log(command);
        var childProcess = this.childProcess = child_process.exec(command);
        childProcess.stdout.on('data', function (data) {
            console.log("stdout: " + data);
        });
        childProcess.stderr.on('data', function (data) {
            console.error("stderr: " + data);
        });
        childProcess.on('close', function (code) {
            console.log("child process exited with code " + code);
        });
        this.client = new src_1.Web3EthereumClient({
            http: "http://localhost:" + port
        });
        return new Promise(function (resolve) { return setTimeout(resolve, 1000); });
    };
    GethNode.prototype.isRunning = function () {
        return this.childProcess != null;
    };
    GethNode.prototype.stop = function () {
        var _this = this;
        if (!this.childProcess)
            return Promise.resolve();
        return new Promise(function (resolve, reject) {
            _this.childProcess.kill();
            _this.childProcess.on('close', function (code) {
                _this.childProcess = null;
                resolve();
            });
        });
    };
    GethNode.initialize = function () {
        return new Promise(function (resolve, reject) {
            rimraf('./temp/eth', function (error, stdout, stderr) {
                if (error)
                    reject(error);
                else
                    resolve(stdout);
            });
        });
    };
    return GethNode;
}());
GethNode.instanceIndex = 0;
exports.GethNode = GethNode;
function mine(node, port, milliseconds) {
    console.log('Mining for ' + milliseconds + ' milliseconds.');
    var previousBlockNumber;
    var wasRunning = node.isRunning();
    return node.stop()
        .then(function () { return node.startMiner(port); })
        .then(function () { return node.getClient().getBlockNumber(); })
        .then(function (blockNumber) { return previousBlockNumber = blockNumber; })
        .then(function () { return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); }); })
        .then(function () { return node.getClient().getBlockNumber(); })
        .then(function (blockNumber) { return console.log('Mined ' + (blockNumber - previousBlockNumber) + " blocks."); })
        .then(function () { return node.stop(); })
        .then(function () {
        if (wasRunning) {
            return node.start(port);
        }
    });
}
exports.mine = mine;
//# sourceMappingURL=geth-node.js.map