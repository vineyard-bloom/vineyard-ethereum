"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require('child_process');
var Status;
(function (Status) {
    Status[Status["inactive"] = 0] = "inactive";
    Status[Status["active"] = 1] = "active";
})(Status || (Status = {}));
function waitUntilRunning() {
    return new Promise((resolve, reject) => {
        const poll = () => {
            console.log('Geth is now running');
            resolve();
        };
        setTimeout(poll, 10000);
    });
}
class GethServer {
    constructor() {
        this.status = Status.inactive;
    }
    start() {
        console.log('Starting Geth');
        // const childProcess = this.childProcess = child_process.exec('geth --datadir=~/myBlockchain/node1 --networkid 100 --identity node1 --rpc --rpcport 8545 --rpcapi=\"db,eth,net,web3,personal,web3\" --keystore ./keystores console')
        const childProcess = this.childProcess = child_process.exec('node scripts/all');
        childProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        childProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        childProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
        return waitUntilRunning();
    }
    stop() {
        if (!this.childProcess) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            this.childProcess.kill();
            this.childProcess.on('close', (code) => {
                resolve();
            });
        });
    }
}
exports.GethServer = GethServer;
//# sourceMappingURL=gethServer.js.map