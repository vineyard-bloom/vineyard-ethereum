"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var geth_node_1 = require("./geth-node");
var promise_each2_1 = require("promise-each2");
var child_process = require('child_process');
var rimraf = require('rimraf');
var fs = require('fs');
var EthereumNetwork = (function () {
    function EthereumNetwork(config) {
        this.nextPort = 8546;
        this.coinbase = '0x0b7ffe7140d55b39f200557ef0f9ec1dd2e8f1ba';
        this.enode = undefined;
        this.enodes = [];
        this.nodes = [];
        this.config = config;
        this.config.tempPath = './temp/eth';
        this.config.coinbase = this.coinbase;
    }
    EthereumNetwork.prototype.getCoinbase = function () {
        return this.coinbase;
    };
    EthereumNetwork.prototype.createNode = function () {
        var config = Object.assign({
            // bootnodes: this.enode,
            enodes: [].concat(this.enodes)
        }, this.config);
        var node = new geth_node_1.GethNode(config, this.nextPort++);
        var GenesisPath = config.tempPath + '/genesis.json';
        node.initialize(GenesisPath);
        fs.writeFileSync(node.getKeydir() + '/UTC--2017-08-01T22-03-26.486575100Z--0b7ffe7140d55b39f200557ef0f9ec1dd2e8f1ba', '{"address":"0b7ffe7140d55b39f200557ef0f9ec1dd2e8f1ba","crypto":{"cipher":"aes-128-ctr","ciphertext":"4ce91950a0afbd17a8a171ce0cbac5e16b5c1a326d65d567e3f870324a36605f","cipherparams":{"iv":"1c765de19104d873b165e6043d006c11"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"d5c37ef44846f7fcef185c71e7f4c588a973fbbde13224a6f76ffa8924b7e0e0"},"mac":"b514587de559a69ce5080c8e6820fbc5a30495320d408be07b4f2253526265f7"},"id":"3d845d15-e801-4096-830b-84f8d5d50df9","version":3}');
        this.nodes.push(node);
        this.enodes.push(node.getNodeUrl());
        return node;
    };
    EthereumNetwork.prototype.createMiner = function () {
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createNode()];
                    case 1:
                        node = _a.sent();
                        node.startMining();
                        return [2 /*return*/, node];
                }
            });
        });
    };
    EthereumNetwork.prototype.createControlNode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createNode()];
                    case 1:
                        node = _a.sent();
                        return [4 /*yield*/, node.start()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, node];
                }
            });
        });
    };
    EthereumNetwork.prototype.createMiners = function (count) {
        return __awaiter(this, void 0, void 0, function () {
            var result, i, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        result = [];
                        i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(i < count)) return [3 /*break*/, 4];
                        _b = (_a = result).push;
                        return [4 /*yield*/, this.createMiner()];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 3;
                    case 3:
                        ++i;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, result];
                }
            });
        });
    };
    EthereumNetwork.prototype.getMainNode = function () {
        return this.mainNode;
    };
    EthereumNetwork.prototype.resetTempDir = function () {
        rimraf.sync('./temp/eth'); // Right now still hard-coded because I don't trust rm -rf.
        if (!fs.existsSync(this.config.tempPath)) {
            fs.mkdirSync(this.config.tempPath);
        }
    };
    EthereumNetwork.prototype.initialize = function () {
        this.resetTempDir();
        var GenesisPath = this.config.tempPath + '/genesis.json';
        this.createGenesisFile(GenesisPath);
        // this.mainNode = this.createNode()
    };
    EthereumNetwork.prototype.start = function () {
        // return this.mainNode.start()
    };
    EthereumNetwork.prototype.stop = function () {
        return promise_each2_1.each(this.nodes, function (node) { return node.stop(); });
    };
    EthereumNetwork.prototype.createGenesisFile = function (path) {
        var content = {
            'config': {
                'chainId': 15,
                'homesteadBlock': 0,
                'eip155Block': 0,
                'eip158Block': 0
            },
            'alloc': (_a = {},
                _a[this.coinbase] = { 'balance': '111100113120000000000052' },
                _a),
            'coinbase': this.coinbase,
            'difficulty': '0x20000',
            'extraData': '',
            'gasLimit': '0x2fefd8',
            'nonce': '0x0000000000000042',
            'mixhash': '0x0000000000000000000000000000000000000000000000000000000000000000',
            'parentHash': '0x0000000000000000000000000000000000000000000000000000000000000000',
            'timestamp': '0x00'
        };
        var fs = require('fs');
        fs.writeFileSync(path, JSON.stringify(content), 'utf8');
        var _a;
    };
    return EthereumNetwork;
}());
exports.EthereumNetwork = EthereumNetwork;
function createNetwork(config) {
    var network = new EthereumNetwork(config);
    network.initialize();
    return network;
}
exports.createNetwork = createNetwork;
//# sourceMappingURL=ethereum-network.js.map