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
const Web3 = require('web3');
const SolidityCoder = require('web3/lib/solidity/coder.js');
class TokenClient {
    constructor(ethereumConfig, currency, tokenContractAddress, abi, web3) {
        this.methodIDs = {};
        this.web3 = utility_1.initializeWeb3(ethereumConfig, web3);
        this.tokenContractAddress = tokenContractAddress;
        this.currency = currency;
        this.abi = this.addAbi(abi);
    }
    send(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_functions_1.sendWeb3Transaction(this.web3, transaction);
        });
    }
    getBlockIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            return client_functions_1.getBlockIndex(this.web3);
        });
    }
    getLastBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            return client_functions_1.getLastBlock(this.web3);
        });
    }
    getTransactionStatus(txid) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_functions_1.getTransactionStatus(this.web3, txid);
        });
    }
    getNextBlockInfo(blockIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_functions_1.getNextBlockInfo(this.web3, blockIndex);
        });
    }
    getFullBlock(blockIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_functions_1.getFullTokenBlock(this.web3, blockIndex, this.tokenContractAddress, this.methodIDs);
        });
    }
    getBlock(blockIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_functions_1.getBlock(this.web3, blockIndex);
        });
    }
    getTransactionReceipt(txid) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_functions_1.getTransactionReceipt(this.web3, txid);
        });
    }
    addAbi(abiArray) {
        if (Array.isArray(abiArray)) {
            abiArray.map((abi) => {
                if (abi.name) {
                    const signature = new Web3().sha3(abi.name + '(' + abi.inputs.map(function (input) {
                        return input.type;
                    }).join(',') + ')');
                    if (abi.type === 'event') {
                        this.methodIDs[signature.slice(2)] = abi;
                    }
                    else {
                        this.methodIDs[signature.slice(2, 10)] = abi;
                    }
                }
            });
            return abiArray;
        }
        else {
            throw new Error('Expected ABI array, got ' + typeof abiArray);
        }
    }
}
exports.TokenClient = TokenClient;
//# sourceMappingURL=token-client.js.map