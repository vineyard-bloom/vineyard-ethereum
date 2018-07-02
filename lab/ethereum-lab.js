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
const ethereum_network_1 = require("./ethereum-network");
class EthereumLab {
    constructor(tempPath, startingPort, gethPath, keystore) {
        this.network = ethereum_network_1.createNetwork({
            tempPath: tempPath,
            startingPort: startingPort,
            keystore: keystore,
            gethPath: gethPath || 'geth'
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.network.initialize();
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.network.stop();
        });
    }
    send(address, amount) {
        throw new Error('Not yet implemented');
    }
    reset() {
        throw new Error('Not yet implemented');
    }
}
exports.EthereumLab = EthereumLab;
//# sourceMappingURL=ethereum-lab.js.map