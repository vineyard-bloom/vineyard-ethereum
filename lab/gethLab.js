"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gethServer_1 = require("./gethServer");
const child_process = require('child_process');
const fs = require('fs');
class GethLab {
    constructor(config, client, server = new gethServer_1.GethServer()) {
        this.defaultAddress = '';
        this.config = config;
        this.client = client;
        this.server = server;
    }
    getSweepAddress() {
        throw new Error('Not implemented.');
        // return this.config.ethereum.sweepAddress
    }
    start() {
        return this.server.start();
    }
    stop() {
        return this.server.stop();
    }
    reset() {
        // return this.deleteWallet()
        return this.stop()
            .then(() => this.start());
    }
    send(address, amount) {
        return new Promise((resolve, reject) => {
            this.client.send('', address, amount)
                .then(result => console.log(result))
                .catch(error => console.log(error));
        });
    }
    generate(blockCount) {
        return Promise.resolve();
    }
}
exports.GethLab = GethLab;
//# sourceMappingURL=gethLab.js.map