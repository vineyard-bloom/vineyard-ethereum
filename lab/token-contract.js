"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TokenContract = (function () {
    function TokenContract(client) {
        this.client = client;
        this.web3 = client.getWeb3();
    }
    TokenContract.prototype.compileContract = function (source) {
        return this.web3.eth.compile.solidity(source);
    };
    TokenContract.prototype.loadContract = function (abi) {
        return this.web3.eth.contract(abi);
    };
    TokenContract.prototype.interactWithContract = function (abi, address, func, params, from) {
        var instance = this.loadContract(abi).at(address);
        return instance.func.sendTransaction(params, { from: from });
    };
    return TokenContract;
}());
exports.TokenContract = TokenContract;
//# sourceMappingURL=token-contract.js.map