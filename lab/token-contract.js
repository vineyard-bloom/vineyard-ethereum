"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    return TokenContract;
}());
exports.TokenContract = TokenContract;
//# sourceMappingURL=token-contract.js.map