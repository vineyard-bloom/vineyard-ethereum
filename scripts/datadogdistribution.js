"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hot_shots_1 = require("hot-shots");
const dogstatsd = new hot_shots_1.StatsD();
// Distribute metrics
dogstatsd.distribution('geth.rpc.gettransactionreceipt', 0);
dogstatsd.distribution('geth.rpc.getblock', 0);
dogstatsd.distribution('geth.rpc.getblocknumber', 0);
dogstatsd.distribution('geth.rpc.getlogs', 0);
console.log('done distributing metrics');
// check in metrics explorer on datadog
//# sourceMappingURL=datadogdistribution.js.map