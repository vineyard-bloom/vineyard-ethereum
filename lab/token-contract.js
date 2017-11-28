"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var truffle_contract_1 = require("truffle-contract");
var TokenContract = (function () {
    function TokenContract(client) {
        this.client = client;
        this.web3 = client.getWeb3();
    }
    TokenContract.prototype.compileContract = function (source) {
        return this.web3.eth.compile.solidity(source);
    };
    TokenContract.prototype.loadContract = function (abi) {
        return Promise.resolve(this.web3.eth.contract(abi));
    };
    TokenContract.prototype.getTotalSupply = function (abi, address) {
        return this.loadContract(abi)
            .then(function (contract) {
            return Promise.resolve(contract.at(address))
                .then(function (instance) {
                return instance.totalSupply.call();
            });
        });
    };
    TokenContract.prototype.getData = function (abi, address, from) {
        return this.loadContract(abi)
            .then(function (contract) {
            return Promise.resolve(contract.at(address))
                .then(function (instance) {
                return instance.balanceOf.getData(from);
            });
        });
    };
    TokenContract.prototype.getBalanceOf = function (abi, address, from) {
        //address = token contract address
        //func = token contract method to call
        return this.loadContract(abi)
            .then(function (contract) {
            return Promise.resolve(contract.at(address))
                .then(function (instance) {
                //last param is total tx object
                return instance.balanceOf.call(from);
            });
        });
    };
    TokenContract.prototype.transfer = function (abi, address, from, to, value) {
        return Promise.resolve(this.web3.eth.sendTransaction({ to: address, from: from, gas: 60000, gasPrice: 20000000000, data: response.data }))
            .then(function (result) {
            console.log(result);
            return result;
        }).catch(function (e) {
            console.error(e);
        });
    };
    TokenContract.prototype.getTransactionReceipt = function (hash) {
        return Promise.resolve(this.web3.eth.getTransactionReceipt(hash))
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            console.error(e);
        });
    };
    TokenContract.prototype.watchContract = function (instance, from) {
        var myEvent = instance.Transfer({ from: from }, { fromBlock: 0, toBlock: 'latest' });
        myEvent.watch(function (error, result) {
            console.log('watch results: ', result);
        });
        // const myResults = myEvent.get(function(error, logs){})
    };
    //TODO deploy contract with truffle from in here for easy onboarding
    //different approach with truffle-contract directly - not working
    TokenContract.prototype.setupContract = function (abi, address, func, from) {
        var params = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            params[_i - 4] = arguments[_i];
        }
        var newContract = truffle_contract_1.default(abi);
        newContract.setProvider(this.client);
        newContract.deployed()
            .then(function (instance) {
            //last param is total tx object
            return (_a = instance.func).sendTransaction.apply(_a, params.concat([{ from: from }])).then(function (result) {
                console.log(result);
            });
            var _a;
        });
    };
    return TokenContract;
}());
exports.TokenContract = TokenContract;
//# sourceMappingURL=token-contract.js.map