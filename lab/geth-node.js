"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
var child_process = require('child_process');
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
        this.config = config || {};
        // this.miner = new Miner()
    }
    GethNode.prototype.getWeb3 = function () {
        return this.client.getWeb3();
    };
    GethNode.prototype.getClient = function () {
        return this.client;
    };
    GethNode.prototype.start = function (port) {
        var gethPath = this.config.gethPath || 'geth';
        var datadir = './temp/geth' + GethNode.instanceIndex++;
        console.log('Starting Geth');
        var childProcess = this.childProcess = child_process.exec(gethPath + ' --dev --verbosity 0 --rpc --rpcport ' + port
            + ' --rpcapi=\"db,eth,net,web3,personal,miner,web3\" --keystore ./temp/keystore'
            + ' --datadir ' + datadir + ' --networkid 101 --mine --minerthreads 5 console');
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
        return new Promise(function (resolve, reject) {
            setTimeout(resolve, 1000);
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
GethNode.instanceIndex = 0;
exports.GethNode = GethNode;
//# sourceMappingURL=geth-node.js.map