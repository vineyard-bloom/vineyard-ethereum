"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_functions_1 = require("./client-functions");
class EthereumReadClient {
    constructor(web3) {
        this.web3 = web3;
    }
    getBlockIndex() {
        return client_functions_1.getBlockIndex(this.web3);
    }
    getLastBlock() {
        return client_functions_1.getLastBlock(this.web3);
    }
    getTransactionStatus(txid) {
        return client_functions_1.getTransactionStatus(this.web3, txid);
    }
    getNextBlockInfo(block) {
        return client_functions_1.getNextBlockInfo(this.web3, block);
    }
    getBlockTransactions(block) {
        return client_functions_1.getBlockTransactions(this.web3, block);
    }
}
exports.EthereumReadClient = EthereumReadClient;
//# sourceMappingURL=read-client.js.map