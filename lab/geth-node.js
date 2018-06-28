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
const axios = require('axios');
const ChildProcess = require('child_process');
const rimraf = require('rimraf');
var Status;
(function (Status) {
    Status[Status["inactive"] = 0] = "inactive";
    Status[Status["active"] = 1] = "active";
})(Status || (Status = {}));
class GethNode {
    constructor(config) {
        this.isMiner = false;
        this.rpcRequestId = 1; // Probably not needed but just in case.
        config.verbosity = config.verbosity || 1;
        this.config = config;
        const tempPath = this.config.tempPath || '.';
        this.datadir = tempPath + '/geth/' + config.index;
        this.keydir = tempPath + '/keystore/' + config.index;
        this.gethPath = this.datadir;
        this.rpcPort = 8545 + config.index;
        this.client = new src_1.Web3EthereumClient({ http: `http://localhost:${this.rpcPort}` });
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
    getCommonFlags() {
        return ' --nodiscover --keystore ' + this.keydir
            + ' --datadir ' + this.datadir
            + ' --networkid 101 --port=' + (30303 + this.index)
            + ' ' + this.getEtherbaseFlags()
            + ' --ipcdisable';
    }
    getRPCFlags() {
        return ' --rpc --rpcport ' + this.rpcPort
            + ' --rpcapi=\"db,eth,net,personal,debug,miner,admin,web3\" ';
    }
    getEtherbaseFlags() {
        return '--etherbase=' + this.config.coinbase;
    }
    start(flags = '') {
        console.log('Starting Geth');
        const command = this.getCommonFlags()
            + ' --verbosity ' + 4
            + this.getRPCFlags()
            + flags + ' console';
        console.log('geth ' + command);
        return this.launch(command);
    }
    startMining() {
        this.isMiner = true;
        return this.start('--mine --minerthreads=4 --dev.period=0');
    }
    execSync(suffix) {
        const command = this.gethPath
            + this.getCommonFlags()
            + ' --verbosity ' + this.config.verbosity
            + ' ' + suffix;
        console.log(command);
        const result = ChildProcess.execSync(command);
        return result.toString();
    }
    initialize(genesisPath) {
        this.execSync('init ' + genesisPath);
    }
    invoke(method, params = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = {
                jsonrpc: '2.0',
                method: method,
                id: this.rpcRequestId++,
                params: params,
            };
            const response = yield axios.post('http://localhost:' + this.rpcPort, body);
            const result = response.data.result;
            return result;
        });
    }
    getNodeUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            const nodeInfo = yield this.invoke('admin_nodeInfo');
            return nodeInfo.enode;
        });
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
        return this.invoke('admin_addPeer', [enode]);
        // console.log(this.index, 'admin.addPeer(' + enode + ')')
        // this.childProcess.stdin.write('admin.addPeer(' + enode + ')\n')
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
        this.childProcess = ChildProcess.exec(this.config.gethPath + flags);
        this.childProcess.stdout.on('data', (data) => {
            if (this.config.verbosity)
                console.log(this.index, 'stdout:', `${data}`);
        });
        this.childProcess.stderr.on('data', (data) => {
            handlePossibleErrorMessage(this.index, data, this.config.verbosity);
        });
        this.childProcess.on('close', (code) => {
            console.log(this.index, `child process exited with code ${code}`);
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
const errorMessagePattern = /err="(.*?)"/;
function preparePossibleErrorMessage(message) {
    // Currently Geth is outputting non-error messages to stderr.  (Which makes perfect sense in Geth-logic.)
    if (message.substring(0, 4) == 'INFO') {
        return { message, verbosity: 2 };
    }
    else if (message.substring(0, 5) == 'DEBUG') {
        const match = message.match(errorMessagePattern);
        if (match) {
            const message = match[1];
            return { message, verbosity: 1 };
        }
        else {
            return { message, verbosity: 2 };
        }
    }
    else {
        return { message, verbosity: 2 };
    }
}
function handlePossibleErrorMessage(index, message, verbosity = 0) {
    // This may always be a string but just in case...
    if (typeof message !== 'string')
        return;
    const info = preparePossibleErrorMessage(message);
    if (info.verbosity >= verbosity) {
        // console.error(message)
    }
}
//# sourceMappingURL=geth-node.js.map