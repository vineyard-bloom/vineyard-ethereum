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
const promise_each2_1 = require("promise-each2");
const bignumber_js_1 = require("bignumber.js");
const token_contract_1 = require("../lab/token-contract");
function gweiToWei(amount) {
    return amount.times('1000000000');
}
exports.gweiToWei = gweiToWei;
class Broom {
    constructor(config, ethereumManager, ethereumClient) {
        this.config = config;
        this.manager = ethereumManager;
        this.client = ethereumClient;
        this.tokenContract = new token_contract_1.TokenContract(this.client);
        this.gasTotal = this.getTotalGas();
    }
    getTotalGas() {
        const totalGwei = (new bignumber_js_1.default(this.config.gas)).times(new bignumber_js_1.default(this.config.gasPrice));
        return totalGwei;
    }
    saveSweepRecord(bristle) {
        return this.manager.saveSweepRecord(bristle);
    }
    sweep() {
        console.log('Starting Ethereum sweep');
        return this.manager.getDustyAddresses()
            .then(addresses => {
            console.log('Dusty addresses', addresses.length, addresses);
            return promise_each2_1.each(addresses, (address) => this.singleSweep(address));
        })
            .then(() => console.log('Finished Ethereum sweep'));
    }
    tokenSweep(abi) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Starting Token sweep');
            yield this.provideGas(abi);
            return this.manager.getDustyAddresses()
                .then(addresses => {
                console.log('Dusty token addresses', addresses.length, addresses);
                return promise_each2_1.each(addresses, (address) => this.tokenSingleSweep(abi, address));
            })
                .then(() => console.log('Finished Token sweep'));
        });
    }
    tokenSingleSweep(abi, address) {
        return this.tokenContract.getBalanceOf(abi, this.config.tokenContractAddress, address)
            .then(balance => {
            console.log('Sweeping address', address);
            return this.client.unlockAccount(address).then(() => {
                return this.tokenContract.transfer(abi, this.config.tokenContractAddress, address, this.config.sweepAddress, balance.toNumber())
                    .then(tx => {
                    console.log('Sweeping address succeeded', tx);
                    return this.saveSweepRecord({
                        from: address,
                        to: this.config.sweepAddress,
                        status: 0,
                        txid: tx,
                        amount: balance
                    });
                })
                    .catch(e => {
                    console.error('Error sweeping token: ', e.message);
                    return new Error(e);
                });
            })
                .catch((e) => {
                console.error('Error getting token address balance: ', e.message);
                return new Error(e);
            });
        })
            .catch(e => {
            console.error('Error unlocking address in token sweep: ', e.message);
            return new Error(e);
        });
    }
    needsGas(abi, address) {
        return this.tokenContract.getBalanceOf(abi, this.config.tokenContractAddress, address)
            .then(tokenBalance => this.client.getBalance(address)
            .then((ethBalance) => parseFloat(tokenBalance) > 0 && ethBalance.toNumber() < 300000000000000));
    }
    gasTransaction(abi, address) {
        return this.needsGas(abi, address)
            .then(gasLess => {
            if (gasLess) {
                const tx = {
                    from: this.config.hotWallet,
                    to: address,
                    value: this.client.toWei(0.0003),
                    gas: this.config.gas,
                    gasPrice: this.config.gasPrice
                };
                return this.client.sendTransaction(tx).then((result) => {
                    this.manager.saveGasTransaction({ address: result.to, txid: result.hash });
                });
            }
        });
    }
    provideGas(abi) {
        console.log('Starting Token Gas Provider');
        return this.manager.getDustyAddresses()
            .then(addresses => {
            console.log('Dusty addresses', addresses.length, addresses);
            return promise_each2_1.each(addresses, (address) => this.gasTransaction(abi, address));
        })
            .then(() => console.log('Finished Token Gas Provider job'));
    }
    singleSweep(address) {
        return this.client.getBalance(address)
            .then((balance) => {
            const sendAmount = balance.minus(this.gasTotal);
            if (sendAmount.greaterThan(this.gasTotal)) {
                const transaction = {
                    from: address,
                    to: this.config.sweepAddress,
                    value: sendAmount,
                    gas: this.config.gas,
                    gasPrice: this.config.gasPrice
                };
                console.log('Sweeping address', transaction);
                return this.client.sendTransaction(transaction)
                    .then((tx) => {
                    console.log('Sweeping address succeeded', tx.hash);
                    return this.saveSweepRecord({
                        from: address,
                        to: this.config.sweepAddress,
                        status: 0,
                        txid: tx.hash,
                        amount: sendAmount
                    });
                });
            }
            return Promise.resolve();
        });
    }
}
exports.Broom = Broom;
//# sourceMappingURL=sweep.js.map