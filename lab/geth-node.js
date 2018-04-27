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
const src_1 = require("../src");
const ChildProcess = require('child_process');
const rimraf = require('rimraf');
var Status;
(function (Status) {
    Status[Status["inactive"] = 0] = "inactive";
    Status[Status["active"] = 1] = "active";
})(Status || (Status = {}));
class GethNode {
    constructor(config, port) {
        this.client = undefined;
        this.config = config || {};
        this.index = GethNode.instanceIndex++;
        this.datadir = './temp/eth/geth' + this.index;
        this.keydir = './temp/eth/keystore' + this.index;
        this.port = port;
        this.config.gethPath = this.config.gethPath || 'geth';
    }
    getWeb3() {
        return this.client.getWeb3();
    }
    getClient() {
        return this.client;
    }
    getKeydir() {
        return this.keydir;
    }
    getBootNodeFlags() {
        return '';
        // return this.config.bootnodes
        //   ? ' --bootnodes ' + this.config.bootnodes + ' '
        //   : ''
    }
    getCommonFlags() {
        const verbosity = this.config.verbosity || 0;
        return ' --ipcdisable --nodiscover --keystore ' + this.keydir
            + ' --datadir ' + this.datadir
            + ' --verbosity ' + verbosity
            + ' --networkid 101 --port=' + (30303 + this.index)
            + ' ' + this.getEtherbaseFlags();
    }
    getRPCFlags() {
        return ' --rpc --rpcport ' + this.port
            + ' --rpcapi=\"db,eth,net,web3,personal,miner,web3\" ';
    }
    getEtherbaseFlags() {
        return '--etherbase=' + this.config.coinbase;
    }
    start(flags = '') {
        console.log('Starting Geth');
        const command = this.getCommonFlags() + this.getRPCFlags() + this.getBootNodeFlags() + flags + ' console';
        console.log('geth ' + command);
        return this.launch(command);
    }
    startMining() {
        return this.start('--mine --minerthreads=4');
    }
    execSync(suffix) {
        const command = this.config.gethPath + this.getCommonFlags() + ' ' + suffix;
        console.log(command);
        const result = ChildProcess.execSync(command);
        return result.toString();
    }
    initialize(genesisPath) {
        return this.execSync('init ' + genesisPath);
    }
    getNodeUrl() {
        return this.execSync('--exec admin.nodeInfo.enode console')
            .replace(/\r|\n/g, '')
            .replace('[::]', '127.0.0.1');
    }
    isRunning() {
        return this.childProcess != null;
    }
    isConnected() {
        return this.client.getWeb3().isConnected();
    }
    mineBlocks(blockCount, timeout = 10000) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Mining', blockCount, 'blocks');
            const originalBlock = yield this.getClient().getBlockNumber();
            const targetBlock = originalBlock + blockCount;
            const pauseDuration = 50;
            const next = (duration) => __awaiter(this, void 0, void 0, function* () {
                yield new Promise(resolve => setTimeout(resolve, pauseDuration));
                const blockNumber = yield this.getClient().getBlockNumber();
                if (blockNumber < targetBlock) {
                    if (duration >= timeout) {
                        throw new Error('Block mining exceeded timeout of ' + timeout + ' milliseconds. '
                            + (blockNumber - originalBlock) + ' blocks were mined.');
                    }
                    else {
                        return next(duration + pauseDuration);
                    }
                }
                console.log('Mined ' + (blockNumber - originalBlock) + ' blocks');
            });
            return next(0);
        });
    }
    addPeer(enode) {
        console.log(this.index, 'admin.addPeer(' + enode + ')');
        this.childProcess.stdin.write('admin.addPeer(' + enode + ')\n');
    }
    listPeers() {
        this.childProcess.stdin.write('admin.peers\n');
    }
    stop() {
        if (!this.childProcess) {
            return Promise.resolve();
        }
        console.log(this.index, 'Stopping node.');
        this.client.getWeb3().reset();
        return new Promise((resolve, reject) => {
            this.childProcess.stdin.write('exit\n');
            this.childProcess.kill();
            const onStop = () => {
                if (this.childProcess) {
                    this.childProcess = null;
                    console.log(this.index, 'Node stopped.');
                    resolve();
                }
            };
            this.childProcess.on('close', (code) => {
                onStop();
            });
            setTimeout(() => {
                onStop();
            }, 500);
        });
    }
    launch(flags) {
        const childProcess = this.childProcess = ChildProcess.exec(this.config.gethPath + flags);
        childProcess.stdout.on('data', (data) => {
            console.log(this.index, 'stdout:', `${data}`);
        });
        childProcess.stderr.on('data', (data) => {
            console.error(this.index, 'stderr:', `${data}`);
        });
        this.childProcess.on('close', (code) => {
            console.log(this.index, `child process exited with code ${code}`);
        });
        this.client = new src_1.Web3EthereumClient({
            http: 'http://localhost:' + this.port
        });
        return new Promise(resolve => {
            let isFinished = false;
            const finished = () => {
                if (!isFinished) {
                    isFinished = true;
                    console.log(this.index, 'Connected to web3', ' (is connected):', this.isConnected());
                    resolve();
                }
            };
            setTimeout(finished, 5500);
            const next = () => {
                return new Promise(resolve => setTimeout(resolve, 50))
                    .then(() => {
                    if (isFinished) {
                        return;
                    }
                    if (!this.isConnected()) {
                        return next();
                    }
                    finished();
                });
            };
            next();
        })
            .then(() => {
            const enodes = this.config.enodes || [];
            for (let i = 0; i < enodes.length; ++i) {
                this.addPeer(enodes[i]);
            }
        });
    }
}
GethNode.instanceIndex = 0;
exports.GethNode = GethNode;
//# sourceMappingURL=geth-node.js.map