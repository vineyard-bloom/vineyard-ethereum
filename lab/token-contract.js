"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var truffle_contract_1 = require("truffle-contract");
var TokenContract = /** @class */ (function () {
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
    TokenContract.prototype.interactWithContract = function (abi, address, func, from) {
        var params = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            params[_i - 4] = arguments[_i];
        }
        //address = token contract address
        //func = token contract method to call
        this.loadContract(abi)
            .then(function (contract) {
            return contract.at(address)
                .then(function (instance) {
                //last param is total tx object
                return (_a = instance.func).sendTransaction.apply(_a, params.concat([{ from: from }]));
                var _a;
            });
        });
    };
    TokenContract.prototype.transfer = function (abi, address, func, from) {
        var params = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            params[_i - 4] = arguments[_i];
        }
        //address = token contract address
        //func = token contract method to call
        this.loadContract(abi)
            .then(function (contract) {
            return Promise.resolve(contract.at(address))
                .then(function (instance) {
                Promise.resolve((_a = instance.transfer).sendTransaction.apply(_a, params.concat([{ from: from, gas: 4712388 }])))
                    .then(function (result) {
                    console.log(result);
                }).catch(function (e) {
                    console.error(e);
                });
                var _a;
            });
        });
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