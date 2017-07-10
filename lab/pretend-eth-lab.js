"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PretendEthLab = (function () {
    function PretendEthLab(client) {
        this.client = client;
        client.importAddress('');
    }
    PretendEthLab.prototype.start = function () {
        return null;
    };
    PretendEthLab.prototype.generate = function (amount) {
        return this.client.generate('', amount);
    };
    PretendEthLab.prototype.send = function (amount) {
        return this.client.send('', '', amount);
    };
    return PretendEthLab;
}());
exports.PretendEthLab = PretendEthLab;
//# sourceMappingURL=pretend-eth-lab.js.map