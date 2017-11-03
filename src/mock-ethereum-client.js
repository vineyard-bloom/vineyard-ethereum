"use strict";
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
            id: 0,
            transactions: [],
            timestamp: Math.floor(Date.now() / 1000),
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
                timeMinded: nextBlock.timestamp
            };
        });
    };
    MockEthereumClient.prototype.getFullBlock = function (block) {
        return this.mockWeb3.mockEth.getBlock(block.id, this.blocks, function (fullBlock) {
            return {
                hash: fullBlock.hash,
                index: fullBlock.number,
                timeMined: fullBlock.timestamp,
                transactions: fullBlock.transactions
            };
        });
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
                id: this.blocks.length,
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
            from: fromAddress,
            to: toAddress,
            value: value,
            gas: gas,
            blockNumber: this.blocks.length - 1,
            // time: Math.floor(Date.now() / 1000),
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