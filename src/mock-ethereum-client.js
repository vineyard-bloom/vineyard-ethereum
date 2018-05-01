"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Everything in this file is deprecated.  Any similar functionality should be in the /lab directory.
class PredefinedAddressSource {
    constructor(addresses) {
        this.index = 0;
        this.addresses = addresses;
    }
    generateAddress() {
        return Promise.resolve(this.addresses[this.index++]);
    }
}
exports.PredefinedAddressSource = PredefinedAddressSource;
class RandomAddressSource {
    generateAddress() {
        return Promise.resolve('fake-eth-address-' + Math.floor((Math.random() * 100000) + 1));
    }
}
exports.RandomAddressSource = RandomAddressSource;
class MockEth {
    constructor() {
        this.coinbase = '';
    }
    getBalance(address) {
        return address.balance;
    }
    getBlock(blockNumber, blocks, cb) {
        return blocks[blockNumber];
    }
    blockNumber(blocks) {
        return new Promise((resolve, reject) => {
            resolve(blocks[blocks.length - 1]);
        });
    }
    getTransaction(txid, transactions) {
        return transactions[txid];
    }
}
exports.MockEth = MockEth;
class MockWeb3 {
    constructor(mockEth) {
        this.mockEth = mockEth;
    }
}
exports.MockWeb3 = MockWeb3;
//# sourceMappingURL=mock-ethereum-client.js.map