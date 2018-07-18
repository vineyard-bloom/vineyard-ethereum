import { StatsD } from 'hot-shots'
const dogstatsd = new StatsD()

// Distribute metrics
dogstatsd.distribution('geth.rpc.gettransactionreceipt', 0)
dogstatsd.distribution('geth.rpc.getblock', 0)
dogstatsd.distribution('geth.rpc.getblocknumber', 0)
dogstatsd.distribution('geth.rpc.getlogs', 0)
console.log('done distributing metrics')
// check in metrics explorer on datadog
