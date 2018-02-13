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
const contract = require('truffle-contract');
// this is SALT smart contract - artifact of running truffle-compile
const saltCompiledContract = require('../test/res/compiled-salt-contract.json');
class TokenContract {
    constructor(client, abi) {
        this.client = client;
        this.web3 = client.getWeb3();
        // TODO run truffle compile to build contract abi
        this.rawCompiledContract = saltCompiledContract;
        this.abi = abi ? abi : this.rawCompiledContract.abi;
        // this is for deploying a contract locally in test environment
        this.contract = contract(this.rawCompiledContract);
        this.contract.setProvider(this.web3.currentProvider || 'https://localhost:8545');
    }
    compileContract(source) {
        // deprecated
        return this.web3.eth.compile.solidity(source);
    }
    getContract(abi) {
        return Promise.resolve(this.web3.eth.contract(abi));
    }
    // this is for unit testing
    loadContract(address) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.unlockAccount(address);
            try {
                const instance = yield this.contract.new({ from: address, gas: 4712388 });
                return instance;
            }
            catch (err) {
                console.error('Error loading contract: ', err);
            }
        });
    }
    getTotalSupply(abi, address) {
        return this.getContract(abi)
            .then(contract => {
            return Promise.resolve(contract.at(address))
                .then(instance => {
                return instance.totalSupply.call();
            });
        });
    }
    getData(abi, address, from) {
        return this.getContract(abi)
            .then(contract => {
            return Promise.resolve(contract.at(address))
                .then(instance => {
                return instance.balanceOf.getData(from);
            });
        });
    }
    getBalanceOf(abi, address, from) {
        // address = token contract address
        // func = token contract method to call
        return this.getContract(abi)
            .then(contract => {
            return Promise.resolve(contract.at(address))
                .then(instance => {
                // last param is total tx object
                return Promise.resolve(instance.balanceOf.call(from)); // balanceOf is contract specific, make dynamic
            })
                .catch(e => {
                console.error('Error getting balance of: ', e.message);
            });
        });
    }
    transfer(abi, address, from, to, value) {
        // address = token contract address
        return this.getContract(abi)
            .then(contract => {
            return Promise.resolve(contract.at(address))
                .then(instance => {
                // this.watchContract(instance, from)
                return Promise.resolve(instance.transfer.sendTransaction(to, value, { from: from, gas: 4712388 }))
                    .then(result => {
                    console.log('Token transfer success:', result);
                    return result;
                }).catch(e => {
                    console.error('Token transfer error: ', e.message);
                });
            });
        });
    }
    getTransactionReceipt(hash) {
        return Promise.resolve(this.web3.eth.getTransactionReceipt(hash))
            .then(result => {
            return result;
        })
            .catch(e => {
            console.error(e);
        });
    }
    watchContract(instance, from) {
        const myEvent = instance.Transfer({ from: from }, { fromBlock: 0, toBlock: 'latest' });
        myEvent.watch(function (error, result) {
            console.log('watch results: ', result);
        });
        // const myResults = myEvent.get(function(error, logs){})
    }
    // TODO deploy contract with truffle from in here for easy onboarding
    // different approach with truffle-contract directly - not working
    setupContract(abi, address, func, from, ...params) {
        let newContract = contract(abi);
        newContract.setProvider(this.client);
        newContract.deployed()
            .then((instance) => {
            // last param is total tx object
            return instance.func.sendTransaction(...params, { from: from })
                .then((result) => {
                console.log(result);
            });
        });
    }
}
exports.TokenContract = TokenContract;
//# sourceMappingURL=token-contract.js.map