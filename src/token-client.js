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
const types_1 = require("vineyard-blockchain/src/types");
const Web3 = require('web3');
const SolidityCoder = require('web3/lib/solidity/coder.js');
class TokenClient {
    constructor(ethereumConfig, currency, tokenContractAddress, abi) {
        this.methodIDs = {};
        this.web3 = new Web3();
        this.web3.setProvider(new this.web3.providers.HttpProvider(ethereumConfig.http));
        this.tokenContractAddress = tokenContractAddress;
        this.currency = currency;
        this.abi = this.addAbi(abi);
    }
    getBlockIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.web3.eth.getBlockNumber((err, blockNumber) => {
                    if (err) {
                        console.error('Error processing ethereum block number', blockNumber, 'with message', err.message);
                        reject(new Error(err));
                    }
                    else {
                        resolve(blockNumber);
                    }
                });
            });
        });
    }
    getLastBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            let lastBlock = yield this.getBlock(yield this.getBlockNumber());
            return {
                hash: lastBlock.hash,
                index: lastBlock.number,
                timeMined: new Date(lastBlock.timestamp * 1000),
                currency: this.currency
            };
        });
    }
    getTransactionStatus(txid) {
        return __awaiter(this, void 0, void 0, function* () {
            let transactionReceipt = yield this.getTransactionReceipt(txid);
            return transactionReceipt.status.substring(2) === '0' ? types_1.TransactionStatus.rejected : types_1.TransactionStatus.accepted;
        });
    }
    getNextBlockInfo(previousBlock) {
        return __awaiter(this, void 0, void 0, function* () {
            const nextBlockIndex = previousBlock ? previousBlock.index + 1 : 0;
            let nextBlock = yield this.getBlock(nextBlockIndex);
            if (!nextBlock) {
                return undefined;
            }
            return {
                hash: nextBlock.hash,
                index: nextBlock.number,
                timeMined: new Date(nextBlock.timestamp * 1000),
                currency: this.currency
            };
        });
    }
    getFullBlock(block) {
        return __awaiter(this, void 0, void 0, function* () {
            let fullBlock = yield this.getBlock(block.index);
            let blockHeight = yield this.getBlockNumber();
            const filteredTransactions = this.filterTokenTransaction(fullBlock.transactions);
            const decodedTransactions = yield this.decodeTransactions(filteredTransactions);
            const transactions = decodedTransactions.map(t => ({
                txid: t.hash,
                to: t.to,
                from: t.from,
                amount: t.value,
                timeReceived: new Date(fullBlock.timestamp * 1000),
                confirmations: blockHeight - block.index,
                block: t.blockNumber,
                status: t.status
            }));
            return {
                hash: fullBlock.hash,
                index: fullBlock.number,
                timeMined: new Date(fullBlock.timestamp * 1000),
                transactions: transactions
            };
        });
    }
    getBlock(blockIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.web3.eth.getBlock(blockIndex, true, (err, block) => {
                    if (err) {
                        console.error('Error processing ethereum block', blockIndex, 'with message', err.message);
                        reject(new Error(err));
                    }
                    else {
                        resolve(block);
                    }
                });
            });
        });
    }
    getBlockNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.web3.eth.getBlockNumber((err, blockNumber) => {
                    if (err) {
                        console.error('Error processing ethereum block number', blockNumber, 'with message', err.message);
                        reject(new Error(err));
                    }
                    else {
                        resolve(blockNumber);
                    }
                });
            });
        });
    }
    getTransactionReceipt(txid) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.web3.eth.getTransactionReceipt(txid, (err, transaction) => {
                    if (err) {
                        console.error('Error querying transaction', txid, 'with message', err.message);
                        reject(err);
                    }
                    else {
                        resolve(transaction);
                    }
                });
            });
        });
    }
    filterTokenTransaction(transactions) {
        return transactions.filter(tx => {
            if (tx && tx.to) {
                return tx.to.toLowerCase() === this.tokenContractAddress.toLowerCase();
            }
        });
    }
    decodeTransactions(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            let decodedTransactions = [];
            for (let t of transactions) {
                const transaction = yield this.web3.eth.getTransactionReceipt(t.hash);
                if (transaction && transaction.blockNumber && transaction.status === '0x1') {
                    let decoded = this.decodeTransaction(t);
                    t.to = decoded.to;
                    t.value = decoded.value;
                    decodedTransactions.push(t);
                }
            }
            return decodedTransactions;
        });
    }
    decodeTransaction(transaction) {
        let transferTo;
        let transferValue;
        const decodedData = this.decodeMethod(transaction.input);
        if (decodedData) {
            const params = decodedData.params;
            for (let i = 0; i < params.length; ++i) {
                if (params[i].name === '_to') {
                    transferTo = params[i].value;
                }
                if (params[i].name === '_value') {
                    transferValue = params[i].value / 100000000;
                }
            }
            return {
                to: transferTo,
                value: transferValue
            };
        }
        else {
            return {
                to: '',
                value: 0
            };
        }
    }
    decodeMethod(data) {
        const methodID = data.slice(2, 10);
        const abiItem = this.methodIDs[methodID];
        if (abiItem) {
            const params = abiItem.inputs.map((item) => item.type);
            let decoded = SolidityCoder.decodeParams(params, data.slice(10));
            return {
                name: abiItem.name,
                params: decoded.map((param, index) => {
                    let parsedParam = param;
                    if (abiItem.inputs[index].type.indexOf('uint') !== -1) {
                        parsedParam = new Web3().toBigNumber(param).toString();
                    }
                    return {
                        name: abiItem.inputs[index].name,
                        value: parsedParam,
                        type: abiItem.inputs[index].type
                    };
                })
            };
        }
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