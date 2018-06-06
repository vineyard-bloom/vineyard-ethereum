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
const bignumber_js_1 = require("bignumber.js");
const vineyard_blockchain_1 = require("vineyard-blockchain");
const utility_1 = require("./utility");
const Web3 = require('web3');
const SolidityFunction = require('web3/lib/web3/function');
const SolidityEvent = require('web3/lib/web3/event');
const promisify = require('util').promisify;
const axios = require('axios');
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
                // console.error('Error processing ethereum block', blockIndex, 'with message', err.message)
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
                // console.error('Error processing ethereum block number', blockNumber, 'with message', err.message)
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
            timeMined: new Date(lastBlock.timestamp * 1000)
        };
    });
}
exports.getLastBlock = getLastBlock;
function getTransactionReceipt(web3, txid) {
    return new Promise((resolve, reject) => {
        web3.eth.getTransactionReceipt(txid, (err, transaction) => {
            if (err) {
                // console.error('Error querying transaction', txid, 'with message', err.message)
                reject(err);
            }
            else {
                resolve(transaction);
            }
        });
    });
}
exports.getTransactionReceipt = getTransactionReceipt;
function getTransaction(web3, txid) {
    return new Promise((resolve, reject) => {
        web3.eth.getTransaction(txid, (err, transaction) => {
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
exports.getTransaction = getTransaction;
function getTransactionStatus(web3, txid) {
    return __awaiter(this, void 0, void 0, function* () {
        let transactionReceipt = yield getTransactionReceipt(web3, txid);
        return transactionReceipt.status.substring(2) === '0' ? vineyard_blockchain_1.blockchain.TransactionStatus.rejected : vineyard_blockchain_1.blockchain.TransactionStatus.accepted;
    });
}
exports.getTransactionStatus = getTransactionStatus;
function getNextBlockInfo(web3, previousBlockIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        const nextBlockIndex = previousBlockIndex ? previousBlockIndex + 1 : 0;
        let nextBlock = yield getBlock(web3, nextBlockIndex);
        if (!nextBlock) {
            return undefined;
        }
        return {
            hash: nextBlock.hash,
            index: nextBlock.number,
            timeMined: new Date(nextBlock.timestamp * 1000)
        };
    });
}
exports.getNextBlockInfo = getNextBlockInfo;
function convertStatus(gethStatus) {
    switch (gethStatus) {
        case 'pending':
            return vineyard_blockchain_1.blockchain.TransactionStatus.pending;
        case 'accepted':
            return vineyard_blockchain_1.blockchain.TransactionStatus.accepted;
        case 'rejected':
            return vineyard_blockchain_1.blockchain.TransactionStatus.rejected;
        default:
            return vineyard_blockchain_1.blockchain.TransactionStatus.unknown;
    }
}
exports.convertStatus = convertStatus;
exports.toChecksumAddress = Web3.prototype.toChecksumAddress;
function getNullableChecksumAddress(address) {
    return typeof address === 'string'
        ? Web3.prototype.toChecksumAddress(address)
        : undefined;
}
exports.getNullableChecksumAddress = getNullableChecksumAddress;
const erc20GroupedAbi = require('./abi/erc20-grouped.json');
const erc20AttributesAbi = erc20GroupedAbi.attributes;
const erc20BalanceAbi = erc20GroupedAbi.balance;
const erc20TransferEventAbi = erc20GroupedAbi.events.filter(e => e.name == 'Transfer')[0];
const erc20ReadonlyAbi = erc20AttributesAbi.concat(erc20BalanceAbi);
function checkContractMethod(contract, methodName, args = []) {
    const method = contract[methodName];
    const payload = method.toPayload(args);
    const defaultBlock = method.extractDefaultBlock(args);
    return new Promise((resolve, reject) => {
        method._eth.call(payload, defaultBlock, (error, output) => {
            if (error) {
                reject(false);
            }
            else {
                resolve(output !== '0x');
            }
        });
    });
}
exports.checkContractMethod = checkContractMethod;
function callContractMethod(contract, methodName, args = []) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const handler = (err, blockNumber) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(blockNumber);
                }
            };
            const method = contract[methodName];
            method.call.apply(method, args.concat(handler));
        });
    });
}
exports.callContractMethod = callContractMethod;
function callCheckedContractMethod(contract, methodName, args = []) {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield checkContractMethod(contract, methodName, args);
        if (!exists)
            return undefined;
        return callContractMethod(contract, methodName, args);
    });
}
exports.callCheckedContractMethod = callCheckedContractMethod;
function createContract(eth, abi, address) {
    const result = {};
    for (let method of abi) {
        result[method.name] = new SolidityFunction(eth, method, address);
    }
    return result;
}
exports.createContract = createContract;
function deployContract(web3, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const hash = yield promisify(web3.eth.sendTransaction.bind(web3.eth))(args);
        return hash;
    });
}
exports.deployContract = deployContract;
function getTokenContractFromReceipt(web3, receipt) {
    return __awaiter(this, void 0, void 0, function* () {
        const address = receipt.contractAddress;
        const contract = createContract(web3.eth, erc20AttributesAbi, address);
        const result = {
            contractType: vineyard_blockchain_1.blockchain.ContractType.token,
            address: address,
            txid: receipt.transactionHash
        };
        try {
            for (let method of erc20AttributesAbi) {
                const value = yield callCheckedContractMethod(contract, method.name);
                if (value === undefined)
                    return {
                        contractType: vineyard_blockchain_1.blockchain.ContractType.unknown,
                        address: address,
                        txid: receipt.transactionHash
                    };
                result[method.name] = value;
            }
            return result;
        }
        catch (error) {
            return undefined;
        }
    });
}
exports.getTokenContractFromReceipt = getTokenContractFromReceipt;
const transferEvent = new SolidityEvent(undefined, erc20TransferEventAbi, '');
function getBlockContractTransfers(web3, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const events = yield utility_1.getEvents(web3, filter);
        const decoded = events.map(e => transferEvent.decode(e));
        return decoded;
        // return decoded.map(d => ({
        //   to: d.args._to,
        //   from: d.args._from,
        //   amount: d.args._value,
        //   txid: d.transactionHash,
        //   contractAddress: d.address,
        //   blockIndex: d.blockNumber
        // }))
    });
}
exports.getBlockContractTransfers = getBlockContractTransfers;
function decodeTokenTransfer(event) {
    const result = transferEvent.decode(event);
    result.args = {
        to: exports.toChecksumAddress(result.args._to),
        from: exports.toChecksumAddress(result.args._from),
        value: result.args._value
    };
    return result;
}
exports.decodeTokenTransfer = decodeTokenTransfer;
function mapTransactionEvents(events, txid) {
    return events.filter(c => c.transactionHash == txid);
}
exports.mapTransactionEvents = mapTransactionEvents;
function loadTransaction(web3, tx, block, events) {
    return __awaiter(this, void 0, void 0, function* () {
        const receipt = yield getTransactionReceipt(web3, tx.hash);
        if (!receipt)
            throw new Error('Could not find receipt for transaction ' + tx.hash);
        const contract = receipt.contractAddress
            ? yield getTokenContractFromReceipt(web3, receipt)
            : undefined;
        return {
            txid: tx.hash,
            to: getNullableChecksumAddress(tx.to),
            from: getNullableChecksumAddress(tx.from),
            amount: tx.value,
            timeReceived: new Date(block.timestamp * 1000),
            status: convertStatus(tx.status),
            blockIndex: block.number,
            gasUsed: receipt.gasUsed,
            gasPrice: tx.gasPrice,
            fee: tx.gasPrice.times(receipt.gasUsed),
            newContract: contract,
            events: mapTransactionEvents(events, tx.hash),
            nonce: tx.nonce
        };
    });
}
exports.loadTransaction = loadTransaction;
function traceTransaction(web3, txid) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            jsonrpc: '2.0',
            method: 'debug_traceTransaction',
            params: [txid, {}],
            id: 1
        };
        const response = yield axios.post(web3.currentProvider.host, body);
        return response.data.result;
    });
}
exports.traceTransaction = traceTransaction;
function getInternalTransactions(web3, txid) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield traceTransaction(web3, txid);
        const calls = result.structLogs.filter(x => x.op === 'CALL');
        return calls.map(call => {
            const { stack } = call;
            const offset = stack.length - 3;
            return {
                gas: new bignumber_js_1.default('0x' + stack[offset]),
                address: '0x' + stack[offset + 1].slice(24),
                value: new bignumber_js_1.default('0x' + stack[offset + 2]),
            };
        });
    });
}
exports.getInternalTransactions = getInternalTransactions;
function traceWeb3Transaction(web3, txid) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield traceTransaction(web3, txid);
        const callLogs = result.structLogs.filter((x) => x.op === 'CALL')
            .map((x) => ({
            gas: parseInt(x.stack[x.stack.length - 1], 10),
            address: '0x' + x.stack[x.stack.length - 2].slice(24),
            value: parseInt(x.stack[x.stack.length - 3], 16),
        }));
        return callLogs;
    });
}
exports.traceWeb3Transaction = traceWeb3Transaction;
function partitionArray(partitionSize, items) {
    const result = [];
    for (let i = 0; i < items.length; i += partitionSize) {
        result.push(items.slice(i, i + partitionSize));
    }
    return result;
}
exports.partitionArray = partitionArray;
function partitionedMap(partitionSize, action, items) {
    return __awaiter(this, void 0, void 0, function* () {
        const groups = partitionArray(partitionSize, items);
        let result = [];
        for (let group of groups) {
            const promises = group.map(action);
            const newItems = yield Promise.all(promises);
            result = result.concat(newItems);
        }
        return result;
    });
}
exports.partitionedMap = partitionedMap;
function getFullBlock(web3, blockIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        let block = yield getBlock(web3, blockIndex);
        const events = yield utility_1.getEvents(web3, {
            toBlock: blockIndex,
            fromBlock: blockIndex,
        });
        for (let event of events) {
            event.address = exports.toChecksumAddress(event.address);
        }
        // console.log('Loaded', events.length, 'events for block', blockIndex)
        const transactions = yield partitionedMap(10, tx => loadTransaction(web3, tx, block, events), block.transactions);
        // console.log('Loaded', block.transactions.length, 'transactions for block', blockIndex)
        return {
            index: blockIndex,
            hash: block.hash,
            timeMined: new Date(block.timestamp * 1000),
            transactions: transactions
        };
    });
}
exports.getFullBlock = getFullBlock;
function isContractAddress(web3, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const code = yield web3.eth.getCode(address);
        if (code === '0x') {
            return false;
        }
        return true;
    });
}
exports.isContractAddress = isContractAddress;
//# sourceMappingURL=client-functions.js.map