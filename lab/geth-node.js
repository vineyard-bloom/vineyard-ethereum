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
var GethNode = (function () {
    function GethNode(config, port) {
        this.childProcess = null;
        this.config = config || {};
        this.index = GethNode.instanceIndex++;
        this.datadir = './temp/eth/geth' + this.index;
        this.keydir = './temp/eth/keystore' + this.index;
        this.port = port;
        this.config.gethPath = this.config.gethPath || 'geth';
    }
    GethNode.prototype.getWeb3 = function () {
        return this.client.getWeb3();
    };
    GethNode.prototype.getClient = function () {
        return this.client;
    };
    GethNode.prototype.startMining = function () {
        console.log('*** mining');
        return this.start('--mine --minerthreads 8 --etherbase=0x0000000000000000000000000000000000000000');
    };
    GethNode.prototype.launch = function (flags) {
        var _this = this;
        // const splitFlags = flags.trim().split(/\s+/)
        // this.childProcess = child_process.execFile(this.config.gethPath, splitFlags, (error, stdout, stderr) => {
        //   if (error)
        //     throw error
        //
        //   if (stdout)
        //     console.log(this.index, stdout)
        //
        //   if (stderr)
        //     console.error(this.index, error)
        // })
        var childProcess = this.childProcess = child_process.exec(this.config.gethPath + flags);
        childProcess.stdout.on('data', function (data) {
            console.log(_this.index, 'stdout:', "" + data);
        });
        childProcess.stderr.on('data', function (data) {
            console.error(_this.index, 'stderr:', "" + data);
        });
        this.childProcess.on('close', function (code) {
            console.log(_this.index, "child process exited with code " + code);
        });
        this.client = new src_1.Web3EthereumClient({
            http: "http://localhost:" + this.port
        });
        return new Promise(function (resolve) { return setTimeout(resolve, 1000); });
    };
    GethNode.prototype.getBootNodeFlags = function () {
        return this.config.bootnodes
            ? ' --bootnodes ' + this.config.bootnodes + ' '
            : '';
    };
    GethNode.prototype.getCommonFlags = function () {
        var verbosity = this.config.verbosity || 0;
        return ' --ipcdisable --keystore ' + this.keydir
            + ' --datadir ' + this.datadir
            + ' --verbosity ' + verbosity
            + ' --networkid 101 --port=' + (30303 + this.index);
    };
    // getMainCommand(): string {
    //   return this.config.gethPath + this.getCommonFlags()
    // }
    GethNode.prototype.getRPCFlags = function () {
        return ' --rpc --rpcport ' + this.port
            + ' --rpcapi=\"db,eth,net,web3,personal,miner,web3\" ';
    };
    GethNode.prototype.start = function (flags) {
        if (flags === void 0) { flags = ''; }
        console.log('Starting Geth');
        var command = this.getCommonFlags() + this.getRPCFlags() + this.getBootNodeFlags() + flags + ' console';
        console.log('geth ' + command);
        return this.launch(command);
    };
    GethNode.prototype.execSync = function (suffix) {
        var command = this.config.gethPath + this.getCommonFlags() + ' ' + suffix;
        console.log(command);
        var result = child_process.execSync(command);
        return result.toString();
    };
    GethNode.prototype.initialize = function (genesisPath) {
        return this.execSync('init ' + genesisPath);
    };
    GethNode.prototype.getNodeUrl = function () {
        return this.execSync('--exec admin.nodeInfo.enode console')
            .replace(/\r\n/g, '')
            .replace('[::]', '127.0.0.1');
    };
    GethNode.prototype.isRunning = function () {
        return this.childProcess != null;
    };
    GethNode.prototype.isConnected = function () {
        return this.client.getWeb3().isConnected();
    };
    GethNode.prototype.stop = function () {
        var _this = this;
        if (!this.childProcess)
            return Promise.resolve();
        console.log(this.index, 'Stopping node.');
        this.client.getWeb3().reset();
        return new Promise(function (resolve, reject) {
            _this.childProcess.stdin.write("exit\n");
            _this.childProcess.kill();
            _this.childProcess.on('close', function (code) {
                _this.childProcess = null;
                console.log(_this.index, 'Node stopped.');
                resolve();
            });
        });
    };
    GethNode.prototype.mine = function (milliseconds) {
        var _this = this;
        console.log('Mining for ' + milliseconds + ' milliseconds.');
        var previousBlockNumber;
        return this.startMining()
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