"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var geth_node_1 = require("./geth-node");
var EthereumNetwork = (function () {
    function EthereumNetwork(config) {
        this.nextPort = 8546;
        this.config = config;
    }
    EthereumNetwork.prototype.createNode = function () {
        return new geth_node_1.GethNode(this.config, this.nextPort++);
    };
    return EthereumNetwork;
}());
exports.EthereumNetwork = EthereumNetwork;
//# sourceMappingURL=ethereum-network.js.map