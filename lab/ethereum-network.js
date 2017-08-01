"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var geth_node_1 = require("./geth-node");
var child_process = require('child_process');
var rimraf = require('rimraf');
var promise_each2_1 = require("promise-each2");
var EthereumNetwork = (function () {
    function EthereumNetwork(config) {
        this.nextPort = 8546;
        this.coinbase = "0x0000000000000000000000000000000000000001";
        this.enode = null;
        this.nodes = [];
        this.config = config;
        this.config.tempPath = './temp/eth';
    }
    EthereumNetwork.prototype.createNode = function () {
        var config = Object.assign({
            bootnodes: this.enode,
        }, this.config);
        var node = new geth_node_1.GethNode(config, this.nextPort++);
        var GenesisPath = config.tempPath + '/genesis.json';
        node.initialize(GenesisPath);
        this.nodes.push(node);
        return node;
    };
    EthereumNetwork.prototype.getMainNode = function () {
        return this.mainNode;
    };
    EthereumNetwork.prototype.createGenesisFile = function (path) {
        var content = {
            "config": {
                "chainId": 15,
                "homesteadBlock": 0,
                "eip155Block": 0,
                "eip158Block": 0
            },
            "alloc": {
                "0x0000000000000000000000000000000000000001": { "balance": "1111001131200" }
            },
            "coinbase": this.coinbase,
            "difficulty": "0x20000",
            "extraData": "",
            "gasLimit": "0x2fefd8",
            "nonce": "0x0000000000000042",
            "mixhash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "timestamp": "0x00"
        };
        var fs = require('fs');
        fs.writeFileSync(path, JSON.stringify(content), 'utf8');
    };
    EthereumNetwork.prototype.resetTempDir = function () {
        rimraf.sync('./temp/eth'); // Right now still hard-coded because I don't trust rm -rf.
        var fs = require('fs');
        if (!fs.existsSync(this.config.tempPath)) {
            fs.mkdirSync(this.config.tempPath);
        }
    };
    EthereumNetwork.prototype.initialize = function () {
        this.resetTempDir();
        var GenesisPath = this.config.tempPath + '/genesis.json';
        this.createGenesisFile(GenesisPath);
        this.mainNode = this.createNode();
        this.enode = this.mainNode.getNodeUrl();
    };
    EthereumNetwork.prototype.start = function () {
        return this.mainNode.start();
    };
    EthereumNetwork.prototype.stop = function () {
        return promise_each2_1.each(this.nodes, function (node) { return node.stop(); });
    };
    return EthereumNetwork;
}());
exports.EthereumNetwork = EthereumNetwork;
//# sourceMappingURL=ethereum-network.js.map