"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PretendEthLab = (function () {
    function PretendEthLab(client) {
        this.client = client;
        client.importAddress('');
    }
    PretendEthLab.prototype.start = function () {
        return Promise.resolve();
    };
    PretendEthLab.prototype.stop = function () {
        return Promise.resolve();
    };
    PretendEthLab.prototype.reset = function () {
        // return this.deleteWallet()
        return this.start();
        // .then(() => this.deleteWallet())
        // .then(() => this.start())
    };
    PretendEthLab.prototype.send = function (address, amount) {
        return this.client.send('', '', amount);
    };
    PretendEthLab.prototype.getSweepAddress = function () {
        return "";
    };
    return PretendEthLab;
}());
exports.PretendEthLab = PretendEthLab;
//# sourceMappingURL=pretend-eth-lab.js.map