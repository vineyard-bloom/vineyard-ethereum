"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Web3 = require("web3");
var child_process = require('child_process');
var Status;
(function (Status) {
    Status[Status["inactive"] = 0] = "inactive";
    Status[Status["active"] = 1] = "active";
})(Status || (Status = {}));
function waitUntilRunning(node1, node2) {
    return new Promise(function (resolve, reject) {
        var send = function () {
            console.log(node1.eth.getBalance(node1.eth.coinbase).toNumber(), "I AM THE COINBASE BALANCE");
            node1.personal.unlockAccount(node1.eth.coinbase);
            node2.personal.unlockAccount(node2.eth.coinbase);
            node1.eth.sendTransaction({ from: node1.eth.coinbase, to: node1.eth.accounts[1], value: node1.toWei(35) });
            node2.eth.sendTransaction({ from: node2.eth.coinbase, to: node2.eth.accounts[1], value: node2.toWei(35) }, function (tx) { console.log(node2.eth.getTransaction(tx)); });
            resolve();
        };
        setTimeout(send, 10000);
    });
}
var GethNode = (function () {
    function GethNode(client) {
        this.status = Status.inactive;
        this.node1 = new Web3();
        this.node2 = new Web3();
        this.node1.setProvider(new this.node1.providers.HttpProvider("http://localhost:8545/"));
        this.node2.setProvider(new this.node2.providers.HttpProvider("http://localhost:8546/"));
    }
    GethNode.prototype.start = function () {
        console.log('Starting Geth');
        // const childProcess = this.childProcess = child_process.exec('geth --datadir=~/myBlockchain/node1 --networkid 100 --identity node1 --rpc --rpcport 8545 --rpcapi=\"db,eth,net,web3,personal,web3\" --keystore ./keystores console')
        var childProcess1 = this.childProcess1 = child_process.exec('geth --datadir=~/myBlockchain/node2 --port "30303" --networkid 100 --verbosity 4 --identity node2 --rpc --rpcport 8545 --rpcapi=\"db,eth,net,web3,personal,web3\" --keystore ./keystores console');
        var childProcess2 = this.childProcess2 = child_process.exec('geth --datadir=~/myBlockchain/node3 --port "30302" --networkid 100 --verbosity 4 --identity node3 --rpc --rpcport 8546 --rpcapi=\"db,eth,net,web3,personal,web3\" --keystore ./keystores console');
        childProcess1.stdout.on('data', function (data) {
            console.log("stdout: " + data);
        });
        childProcess2.stdout.on('data', function (data) {
            console.log("stdout: " + data);
        });
        childProcess1.stderr.on('data', function (data) {
            console.error("stderr: " + data);
        });
        childProcess2.stderr.on('data', function (data) {
            console.error("stderr: " + data);
        });
        childProcess1.on('close', function (code) {
            console.log("child process exited with code " + code);
        });
        childProcess2.on('close', function (code) {
            console.log("child process exited with code " + code);
        });
        return waitUntilRunning(this.node1, this.node2);
    };
    GethNode.prototype.stop = function () {
        var _this = this;
        if (!this.childProcess1)
            return Promise.resolve();
        return new Promise(function (resolve, reject) {
            _this.childProcess1.kill();
            _this.childProcess1.on('close', function (code) {
                resolve();
            });
        });
    };
    return GethNode;
}());
exports.GethNode = GethNode;
//# sourceMappingURL=double-spend.js.map