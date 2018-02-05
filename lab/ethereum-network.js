"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const geth_node_1 = require("./geth-node");
const promise_each2_1 = require("promise-each2");
const child_process = require('child_process');
const rimraf = require('rimraf');
const fs = require('fs');
class EthereumNetwork {
    constructor(config) {
        this.nextPort = 8546;
        this.coinbase = '0x0b7ffe7140d55b39f200557ef0f9ec1dd2e8f1ba';
        this.enode = undefined;
        this.enodes = [];
        this.nodes = [];
        this.config = config;
        this.config.tempPath = './temp/eth';
        this.config.coinbase = this.coinbase;
    }
    getCoinbase() {
        return this.coinbase;
    }
    createNode() {
        const config = Object.assign({
            // bootnodes: this.enode,
            enodes: [].concat(this.enodes)
        }, this.config);
        const node = new geth_node_1.GethNode(config, this.nextPort++);
        const GenesisPath = config.tempPath + '/genesis.json';
        node.initialize(GenesisPath);
        fs.writeFileSync(node.getKeydir() + '/UTC--2017-08-01T22-03-26.486575100Z--0b7ffe7140d55b39f200557ef0f9ec1dd2e8f1ba', '{"address":"0b7ffe7140d55b39f200557ef0f9ec1dd2e8f1ba","crypto":{"cipher":"aes-128-ctr","ciphertext":"4ce91950a0afbd17a8a171ce0cbac5e16b5c1a326d65d567e3f870324a36605f","cipherparams":{"iv":"1c765de19104d873b165e6043d006c11"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"d5c37ef44846f7fcef185c71e7f4c588a973fbbde13224a6f76ffa8924b7e0e0"},"mac":"b514587de559a69ce5080c8e6820fbc5a30495320d408be07b4f2253526265f7"},"id":"3d845d15-e801-4096-830b-84f8d5d50df9","version":3}');
        this.nodes.push(node);
        this.enodes.push(node.getNodeUrl());
        return node;
    }
    createMiner() {
        return __awaiter(this, void 0, void 0, function* () {
            const node = yield this.createNode();
            node.startMining();
            return node;
        });
    }
    createControlNode() {
        return __awaiter(this, void 0, void 0, function* () {
            const node = yield this.createNode();
            yield node.start();
            return node;
        });
    }
    createMiners(count) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            for (let i = 0; i < count; ++i) {
                result.push(yield this.createMiner());
            }
            return result;
        });
    }
    getMainNode() {
        return this.mainNode;
    }
    resetTempDir() {
        rimraf.sync('./temp/eth'); // Right now still hard-coded because I don't trust rm -rf.
        if (!fs.existsSync(this.config.tempPath)) {
            fs.mkdirSync(this.config.tempPath);
        }
    }
    initialize() {
        this.resetTempDir();
        const GenesisPath = this.config.tempPath + '/genesis.json';
        this.createGenesisFile(GenesisPath);
        // this.mainNode = this.createNode()
    }
    start() {
        // return this.mainNode.start()
    }
    stop() {
        return promise_each2_1.each(this.nodes, (node) => node.stop());
    }
    createGenesisFile(path) {
        const content = {
            'config': {
                'chainId': 15,
                'homesteadBlock': 0,
                'eip155Block': 0,
                'eip158Block': 0
            },
            'alloc': {
                [this.coinbase]: { 'balance': '111100113120000000000052' }
            },
            'coinbase': this.coinbase,
            'difficulty': '0x20000',
            'extraData': '',
            'gasLimit': '0x2fefd8',
            'nonce': '0x0000000000000042',
            'mixhash': '0x0000000000000000000000000000000000000000000000000000000000000000',
            'parentHash': '0x0000000000000000000000000000000000000000000000000000000000000000',
            'timestamp': '0x00'
        };
        const fs = require('fs');
        fs.writeFileSync(path, JSON.stringify(content), 'utf8');
    }
}
exports.EthereumNetwork = EthereumNetwork;
function createNetwork(config) {
    const network = new EthereumNetwork(config);
    network.initialize();
    return network;
}
exports.createNetwork = createNetwork;
//# sourceMappingURL=ethereum-network.js.map