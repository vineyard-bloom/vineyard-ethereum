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
const client_functions_1 = require("./client-functions");
const utility_1 = require("./utility");
const hot_shots_1 = require("hot-shots");
const dogstatsd = new hot_shots_1.StatsD();
class EthereumBlockReader {
    constructor(web3) {
        this.web3 = web3;
    }
    getHeighestBlockIndex() {
        dogstatsd.increment('geth.rpc.getblocknumber');
        return client_functions_1.getBlockIndex(this.web3);
    }
    getBlockBundle(blockIndex) {
        this.incrementDatadogCounters();
        return client_functions_1.getFullBlock(this.web3, blockIndex);
    }
    incrementDatadogCounters() {
        dogstatsd.increment('geth.rpc.gettransactionreceipt');
        dogstatsd.increment('geth.rpc.getblock');
        dogstatsd.increment('geth.rpc.getlogs');
    }
    getBlockTransactions(blockIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = yield client_functions_1.getFullBlock(this.web3, blockIndex);
            return block
                ? block.transactions
                : [];
        });
    }
    static createFromConfig(config) {
        return new EthereumBlockReader(utility_1.initializeWeb3(config));
    }
}
exports.EthereumBlockReader = EthereumBlockReader;
//# sourceMappingURL=block-reader.js.map