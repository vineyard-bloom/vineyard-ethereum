"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hot_shots_1 = require("hot-shots");
const dogstatsd = new hot_shots_1.StatsD();
// Test Metrics
dogstatsd.increment('geth.rpc.gettransactionreceipt');
dogstatsd.increment('geth.rpc.getblock');
dogstatsd.increment('geth.rpc.getblocknumber');
dogstatsd.increment('geth.rpc.getlogs');
console.log('done');
// check in metrics explorer on datadog
//# sourceMappingURL=dogtest.js.map