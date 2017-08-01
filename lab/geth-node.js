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
    function GethNode(config, port) {
        this.childProcess = null;
        this.config = config || {};
        this.index = GethNode.instanceIndex++;
        this.datadir = './temp/eth/geth' + this.index;
        this.keydir = './temp/eth/keystore' + this.index;
        this.port = port;
    }
    GethNode.prototype.getWeb3 = function () {
        return this.client.getWeb3();
    };
    GethNode.prototype.getClient = function () {
        return this.client;
    };
    GethNode.prototype.startMining = function () {
        console.log('*** mining');
        return this.start('--mine --minerthreads 8');
    };
    GethNode.prototype.start = function (flags) {
        var _this = this;
        if (flags === void 0) { flags = ''; }
        var gethPath = this.config.gethPath || 'geth';
        console.log('Starting Geth');
        var command = gethPath + ' --dev --rpc --verbosity 5 --rpcport ' + this.port
            + ' --rpcapi=\"db,eth,net,web3,personal,miner,web3\" --keystore ' + this.keydir
            + ' --datadir ' + this.datadir + ' --networkid 101 ' + flags + ' console';
        console.log(command);
        var childProcess = this.childProcess = child_process.exec(command);
        childProcess.stdout.on('data', function (data) {
            console.log(_this.index, 'stdout:', "" + data);
        });
        childProcess.stderr.on('data', function (data) {
            console.error(_this.index, 'stderr:', "" + data);
        });
        childProcess.on('close', function (code) {
            console.log(_this.index, "child process exited with code " + code);
        });
        this.client = new src_1.Web3EthereumClient({
            http: "http://localhost:" + this.port
        });
        return new Promise(function (resolve) { return setTimeout(resolve, 1000); });
    };
    GethNode.prototype.isRunning = function () {
        return this.childProcess != null;
    };
    GethNode.prototype.stop = function () {
        var _this = this;
        console.log(this.index, 'Stopping node.');
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
    GethNode.prototype.mine = function (milliseconds) {
        var _this = this;
        console.log('Mining for ' + milliseconds + ' milliseconds.');
        var previousBlockNumber;
        return this.startMiner()
            .then(function () { return _this.getClient().getBlockNumber(); })
            .then(function (blockNumber) { return previousBlockNumber = blockNumber; })
            .then(function () { return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); }); })
            .then(function () { return _this.getClient().getBlockNumber(); })
            .then(function (blockNumber) { return console.log('Mined ' + (blockNumber - previousBlockNumber) + " blocks."); })
            .then(function () { return _this.stop(); });
    };
    return GethNode;
}());
GethNode.instanceIndex = 0;
exports.GethNode = GethNode;
// export function mine(node, milliseconds: number) {
//   console.log('Mining for ' + milliseconds + ' milliseconds.')
//   let previousBlockNumber
//   const wasRunning = node.isRunning()
//   return node.stop()
//     .then(() => node.startMiner())
//     .then(() => node.getClient().getBlockNumber())
//     .then(blockNumber => previousBlockNumber = blockNumber)
//     .then(() => new Promise<void>(resolve => setTimeout(resolve, milliseconds)))
//     .then(() => node.getClient().getBlockNumber())
//     .then(blockNumber => console.log('Mined ' + (blockNumber - previousBlockNumber) + " blocks."))
//     .then(() => node.stop())
//     .then(() => {
//       if (wasRunning) {
//         return node.start(port)
//       }
//     })
// }
//# sourceMappingURL=geth-node.js.map