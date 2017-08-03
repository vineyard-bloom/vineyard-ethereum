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
    GethNode.prototype.getKeydir = function () {
        return this.keydir;
    };
    GethNode.prototype.startMining = function () {
        console.log('*** mining');
        return this.start('--mine --minerthreads=4 --etherbase=' + this.config.coinbase);
    };
    GethNode.prototype.launch = function (flags) {
        var _this = this;
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
        return new Promise(function (resolve) {
            var is_finished = false;
            var finished = function () {
                if (!is_finished) {
                    is_finished = true;
                    console.log(_this.index, 'Connected to web3');
                    resolve();
                }
            };
            setTimeout(finished, 1500);
            var next = function () {
                return new Promise(function (resolve) { return setTimeout(resolve, 50); })
                    .then(function () {
                    if (is_finished)
                        return;
                    if (!_this.isConnected())
                        return next();
                    finished();
                });
            };
            next();
        })
            .then(function () {
            for (var i = 0; i < _this.config.enodes.length; ++i) {
                _this.addPeer(_this.config.enodes[i]);
            }
        });
    };
    GethNode.prototype.getBootNodeFlags = function () {
        return '';
        // return this.config.bootnodes
        //   ? ' --bootnodes ' + this.config.bootnodes + ' '
        //   : ''
    };
    GethNode.prototype.getCommonFlags = function () {
        var verbosity = this.config.verbosity || 0;
        return ' --ipcdisable --nodiscover --keystore ' + this.keydir
            + ' --datadir ' + this.datadir
            + ' --verbosity ' + verbosity
            + ' --networkid 101 --port=' + (30303 + this.index);
    };
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
            .replace(/\r|\n/g, '')
            .replace('[::]', '127.0.0.1');
    };
    GethNode.prototype.isRunning = function () {
        return this.childProcess != null;
    };
    GethNode.prototype.isConnected = function () {
        return this.client.getWeb3().isConnected();
    };
    GethNode.prototype.mineBlocks = function (blockCount) {
        var _this = this;
        console.log('Mining', blockCount, 'blocks.');
        var originalBlock, targetBlock;
        var next = function () {
            return new Promise(function (resolve) { return setTimeout(resolve, 100); })
                .then(function () { return _this.getClient().getBlockNumber(); })
                .then(function (blockNumber) {
                if (blockNumber < targetBlock)
                    return next();
                console.log('Mined ' + (blockNumber - originalBlock) + " blocks.");
            });
        };
        return this.getClient().getBlockNumber()
            .then(function (blockNumber) {
            originalBlock = blockNumber;
            targetBlock = blockNumber + blockCount;
        })
            .then(next);
    };
    GethNode.prototype.addPeer = function (enode) {
        console.log(this.index, "admin.addPeer(" + enode + ")");
        this.childProcess.stdin.write("admin.addPeer(" + enode + ")\n");
    };
    GethNode.prototype.listPeers = function () {
        this.childProcess.stdin.write("admin.peers\n");
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
            var onStop = function () {
                if (_this.childProcess) {
                    _this.childProcess = null;
                    console.log(_this.index, 'Node stopped.');
                    resolve();
                }
            };
            _this.childProcess.on('close', function (code) {
                onStop();
            });
            setTimeout(function () {
                onStop();
            }, 500);
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