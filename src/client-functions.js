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
const vineyard_blockchain_1 = require("vineyard-blockchain");
function unlockWeb3Account(web3, address) {
    return new Promise((resolve, reject) => {
        try {
            web3.personal.unlockAccount(address, (err, result) => {
                if (err) {
                    reject(new Error('Error unlocking account: ' + err.message));
                }
                else {
                    resolve(result);
                }
            });
        }
        catch (error) {
            reject(new Error('Error unlocking account: ' + address + '.  ' + error.message));
        }
    });
}
exports.unlockWeb3Account = unlockWeb3Account;
function sendWeb3Transaction(web3, transaction) {
    if (!transaction.from) {
        throw Error('Ethereum transaction.from cannot be empty.');
    }
    if (!transaction.to) {
        throw Error('Ethereum transaction.to cannot be empty.');
    }
    return unlockWeb3Account(web3, transaction.from)
        .then(() => {
        return new Promise((resolve, reject) => {
            web3.eth.sendTransaction(transaction, (err, txid) => {
                if (err) {
                    console.log('Error sending (original)', transaction);
                    reject('Error sending to ' + transaction.to + ': ' + err);
                }
                else {
                    const txInfo = web3.eth.getTransaction(txid);
                    console.log('Sent Ethereum transaction', txid, txInfo);
                    const transactionResult = Object.assign({}, transaction, {
                        hash: txid,
                        gasPrice: txInfo.gasPrice,
                        gas: txInfo.gas
                    });
                    resolve(transactionResult);
                }
            });
        });
    });
}
exports.sendWeb3Transaction = sendWeb3Transaction;
function getBlock(web3, blockIndex) {
    return new Promise((resolve, reject) => {
        web3.eth.getBlock(blockIndex, true, (err, block) => {
            if (err) {
                console.error('Error processing ethereum block', blockIndex, 'with message', err.message);
                reject(new Error(err));
            }
            else {
                resolve(block);
            }
        });
    });
}
exports.getBlock = getBlock;
function getBlockIndex(web3) {
    return new Promise((resolve, reject) => {
        web3.eth.getBlockNumber((err, blockNumber) => {
            if (err) {
                console.error('Error processing ethereum block number', blockNumber, 'with message', err.message);
                reject(new Error(err));
            }
            else {
                resolve(blockNumber);
            }
        });
    });
}
exports.getBlockIndex = getBlockIndex;
function getLastBlock(web3) {
    return __awaiter(this, void 0, void 0, function* () {
        let lastBlock = yield getBlock(web3, yield getBlockIndex(web3));
        return {
            hash: lastBlock.hash,
            index: lastBlock.number,
            timeMined: new Date(lastBlock.timestamp * 1000),
            currency: 2
        };
    });
}
exports.getLastBlock = getLastBlock;
function getTransactionReceipt(web3, txid) {
    return new Promise((resolve, reject) => {
        web3.eth.getTransactionReceipt(txid, (err, transaction) => {
            if (err) {
                console.error('Error querying transaction', txid, 'with message', err.message);
                reject(err);
            }
            else {
                resolve(transaction);
            }
        });
    });
}
exports.getTransactionReceipt = getTransactionReceipt;
function getTransactionStatus(web3, txid) {
    return __awaiter(this, void 0, void 0, function* () {
        let transactionReceipt = yield getTransactionReceipt(web3, txid);
        return transactionReceipt.status.substring(2) === '0' ? vineyard_blockchain_1.TransactionStatus.rejected : vineyard_blockchain_1.TransactionStatus.accepted;
    });
}
exports.getTransactionStatus = getTransactionStatus;
function getNextBlockInfo(web3, previousBlock) {
    return __awaiter(this, void 0, void 0, function* () {
        const nextBlockIndex = previousBlock ? previousBlock.index + 1 : 0;
        let nextBlock = yield getBlock(web3, nextBlockIndex);
        if (!nextBlock) {
            return undefined;
        }
        return {
            hash: nextBlock.hash,
            index: nextBlock.number,
            timeMined: new Date(nextBlock.timestamp * 1000),
            currency: 2
        };
    });
}
exports.getNextBlockInfo = getNextBlockInfo;
function convertStatus(gethStatus) {
    switch (gethStatus) {
        case 'pending':
            return vineyard_blockchain_1.TransactionStatus.pending;
        case 'accepted':
            return vineyard_blockchain_1.TransactionStatus.accepted;
        case 'rejected':
            return vineyard_blockchain_1.TransactionStatus.rejected;
        default:
            throw new Error('Invalid status');
    }
}
exports.convertStatus = convertStatus;
function getBlockTransactions(web3, block) {
    return __awaiter(this, void 0, void 0, function* () {
        let fullBlock = yield getBlock(web3, block.index);
        let blockHeight = yield getBlockIndex(web3);
        const transactions = fullBlock.transactions.map(t => ({
            txid: t.hash,
            to: t.to,
            from: t.from,
            amount: t.value,
            timeReceived: new Date(fullBlock.timestamp * 1000),
            confirmations: blockHeight - block.index,
            status: convertStatus(t.status)
        }));
        return transactions;
    });
}
exports.getBlockTransactions = getBlockTransactions;
//# sourceMappingURL=client-functions.js.map