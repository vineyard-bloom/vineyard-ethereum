"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
var PredefinedAddressSource = /** @class */ (function () {
    function PredefinedAddressSource(addresses) {
        this.index = 0;
        this.addresses = addresses;
    }
    PredefinedAddressSource.prototype.generateAddress = function () {
        return Promise.resolve(this.addresses[this.index++]);
    };
    return PredefinedAddressSource;
}());
exports.PredefinedAddressSource = PredefinedAddressSource;
var RandomAddressSource = /** @class */ (function () {
    function RandomAddressSource() {
    }
    RandomAddressSource.prototype.generateAddress = function () {
        return Promise.resolve('fake-eth-address-' + Math.floor((Math.random() * 100000) + 1));
    };
    return RandomAddressSource;
}());
exports.RandomAddressSource = RandomAddressSource;
var MockEth = /** @class */ (function () {
    function MockEth() {
        this.coinbase = "";
    }
    MockEth.prototype.getBalance = function (address) {
        return address.balance;
    };
    MockEth.prototype.getBlock = function (blockNumber, blocks, cb) {
        return blocks[blockNumber];
    };
    MockEth.prototype.blockNumber = function (blocks) {
        return new Promise(function (resolve, reject) {
            resolve(blocks[blocks.length - 1]);
        });
    };
    MockEth.prototype.getTransaction = function (txid, transactions) {
        return transactions[txid];
    };
    return MockEth;
}());
exports.MockEth = MockEth;
var MockWeb3 = /** @class */ (function () {
    function MockWeb3(mockEth) {
        this.mockEth = mockEth;
    }
    return MockWeb3;
}());
exports.MockWeb3 = MockWeb3;
var MockEthereumClient = /** @class */ (function () {
    function MockEthereumClient(addressSource, mockWeb3) {
        this.addresses = {};
        this.blocks = [];
        this.txindex = 0;
        this.mockWeb3 = mockWeb3;
        this.addressSource = addressSource;
        this.blocks.push({
            number: 0,
            transactions: [],
            timestamp: Math.floor(Date.now() / 1000),
            hash: 'tx-hash-' + this.txindex++
        });
        this.addresses[''] = new bignumber_js_1.default("10000000000000000000000000000");
    }
    MockEthereumClient.prototype.createAddress = function () {
        var _this = this;
        return this.addressSource.generateAddress()
            .then(function (address) {
            _this.addresses[address] = new bignumber_js_1.default(0);
            return Promise.resolve(address);
        });
    };
    MockEthereumClient.prototype.getActiveBlock = function () {
        return this.blocks[this.blocks.length - 1];
    };
    MockEthereumClient.prototype.getLastBlock = function () {
        return this.mockWeb3.mockEth.blockNumber(this.blocks).then(function (lastBlock) {
            return {
                id: lastBlock.hash,
                currency: "ethereum",
                hash: lastBlock.hash,
                index: lastBlock.number,
                timeMined: new Date(lastBlock.timestamp)
            };
        });
    };
    MockEthereumClient.prototype.getTransaction = function (txid) {
        for (var block in this.blocks) {
            return this.mockWeb3.mockEth.getTransaction(txid, this.blocks[block].transactions);
        }
    };
    MockEthereumClient.prototype.getNextBlockInfo = function (previousBlock) {
        var nextBlockIndex = previousBlock ? previousBlock.index + 1 : 0;
        return this.mockWeb3.mockEth.getBlock(nextBlockIndex, this.blocks, function (err, nextBlock) {
            return {
                hash: nextBlock.hash,
                index: nextBlock.number,
                timeMined: nextBlock.timestamp
            };
        });
    };
    MockEthereumClient.prototype.getTransactionStatus = function (txid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 0];
            });
        });
    };
    MockEthereumClient.prototype.getFullBlock = function (block) {
        return {
            hash: block.hash,
            index: block.number,
            timeMined: block.timestamp,
            transactions: block.transactions
        };
    };
    MockEthereumClient.prototype.minePreviousBlock = function (block) {
        var reward = block.transactions.reduce(function (a, b) { return a.plus(b.gas); }, new bignumber_js_1.default(0))
            + this.toWei(5);
        this.addresses[''] = this.addresses[''].plus(reward);
    };
    MockEthereumClient.prototype.generate = function (blockCount) {
        for (var i = 0; i < blockCount; ++i) {
            this.minePreviousBlock(this.getActiveBlock());
            this.blocks.push({
                hash: 'tx-hash-' + this.txindex++,
                number: this.blocks.length,
                transactions: [],
                timestamp: Math.floor(Date.now() / 1000),
            });
        }
        return Promise.resolve();
    };
    MockEthereumClient.prototype.getBalance = function (address) {
        return Promise.resolve(this.addresses[address]);
    };
    MockEthereumClient.prototype.send = function (fromAddress, toAddress, value, gas) {
        if (gas === void 0) { gas = "2100"; }
        var fromBalance = new bignumber_js_1.default("100000000000000000");
        if (fromBalance.lessThan(new bignumber_js_1.default(value).plus(gas)))
            throw new Error('Not enough funds');
        var toBalance = new bignumber_js_1.default("0");
        this.addresses[fromAddress] = fromBalance.minus(new bignumber_js_1.default(value));
        this.addresses[toAddress] = toBalance.plus(new bignumber_js_1.default(value));
        var transaction = {
            txid: "txid" + this.txindex++,
            from: fromAddress,
            to: toAddress,
            amount: value,
            gas: gas,
            blockNumber: this.blocks.length - 1,
            timeReceived: Math.floor(Date.now() / 1000),
            hash: 'tx-hash-' + this.txindex++ //this.blocks.length + '.' + this.getActiveBlock().transactions.length
        };
        this.getActiveBlock().transactions.push(transaction);
        return Promise.resolve(transaction);
    };
    MockEthereumClient.prototype.toWei = function (amount) {
        return new bignumber_js_1.default(amount).times(Math.pow(10, 18)).toString();
    };
    MockEthereumClient.prototype.fromWei = function (amount) {
        return new bignumber_js_1.default(amount).dividedBy(1000000000000000000).toString();
    };
    MockEthereumClient.prototype.importAddress = function (address) {
        this.addresses[address] = new bignumber_js_1.default(0);
        return Promise.resolve();
    };
    MockEthereumClient.prototype.getAccounts = function () {
        throw new Error("Not implemented.");
    };
    MockEthereumClient.prototype.getBlock = function (blockIndex) {
        return Promise.resolve(this.blocks[blockIndex]);
    };
    MockEthereumClient.prototype.getBlockNumber = function () {
        return Promise.resolve(this.blocks.length - 1);
    };
    MockEthereumClient.prototype.getGas = function () {
        return Promise.resolve(21000);
    };
    return MockEthereumClient;
}());
exports.MockEthereumClient = MockEthereumClient;
//# sourceMappingURL=mock-ethereum-client.js.map