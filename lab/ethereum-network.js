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
const childProcess = require('child_process');
const rimraf = require('rimraf');
const fs = require('fs');
exports.defaultKeystore = {
    address: '0x0b7ffe7140d55b39f200557ef0f9ec1dd2e8f1ba',
    path: '/UTC--2017-08-01T22-03-26.486575100Z--0b7ffe7140d55b39f200557ef0f9ec1dd2e8f1ba',
    jsonData: '{"address":"0b7ffe7140d55b39f200557ef0f9ec1dd2e8f1ba","crypto":{"cipher":"aes-128-ctr","ciphertext":"4ce91950a0afbd17a8a171ce0cbac5e16b5c1a326d65d567e3f870324a36605f","cipherparams":{"iv":"1c765de19104d873b165e6043d006c11"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"d5c37ef44846f7fcef185c71e7f4c588a973fbbde13224a6f76ffa8924b7e0e0"},"mac":"b514587de559a69ce5080c8e6820fbc5a30495320d408be07b4f2253526265f7"},"id":"3d845d15-e801-4096-830b-84f8d5d50df9","version":3}'
};
class EthereumNetwork {
    constructor(config) {
        this.config = config;
        this.currentPort = config.startingPort || 8545;
        this.config.keystore = config.keystore || exports.defaultKeystore;
        this.coinbase = this.config.keystore.address;
        this.nodes = [];
    }
    getCoinbase() {
        return this.coinbase;
    }
    createNode() {
        return __awaiter(this, void 0, void 0, function* () {
            const node = new geth_node_1.GethNode({
                index: this.nodes.length,
                tempPath: this.config.tempPath,
                gethPath: this.config.gethPath,
                coinbase: this.coinbase
            });
            const genesisPath = this.config.tempPath + '/genesis.json';
            node.initialize(genesisPath);
            yield node.startMining();
            this.nodes.push(node);
            return node;
        });
    }
    createControlNode() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.nodes.length > 0) {
                console.log('Control node already created');
                return Promise.resolve(this.nodes[0]);
            }
            const node = yield this.createNode();
            fs.writeFileSync(node.getKeydir() + this.config.keystore.path, this.coinbase.jsonData);
            this.nodes.push(node);
            return node;
        });
    }
    resetTempDir() {
        console.log('Resetting temp eth directory');
        rimraf.sync(this.config.tempPath); // triple-check that this works!!!
        if (!fs.existsSync(this.config.tempPath)) {
            console.log('Creating new temp directory');
            fs.mkdirSync(this.config.tempPath);
            fs.mkdirSync(this.config.tempPath + '/keystore');
            fs.mkdirSync(this.config.tempPath + '/geth');
        }
        else {
            console.warn('Error rim-raffing temp eth directory');
        }
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.resetTempDir();
            const genesisPath = this.config.tempPath + '/genesis.json';
            this.createGenesisFile(genesisPath);
            const mainNode = yield this.createControlNode();
            this.nodes.push(mainNode);
            return mainNode;
        });
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
                [this.coinbase.address]: { 'balance': '111100113120000000000052' }
            },
            'coinbase': this.coinbase.address,
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