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
class EthereumBlockClient {
    constructor(web3) {
        this.web3 = web3;
    }
    getBlockIndex() {
        return client_functions_1.getBlockIndex(this.web3);
    }
    getBlockInfo(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = yield client_functions_1.getBlock(this.web3, index);
            return block
                ? {
                    index: block.number,
                    hash: block.hash,
                    timeMined: new Date(block.timestamp * 1000)
                }
                : undefined;
        });
    }
    getBlockTransactions(block) {
        return client_functions_1.getBlockTransactions(this.web3, block);
    }
}
exports.EthereumBlockClient = EthereumBlockClient;
//# sourceMappingURL=block-client.js.map