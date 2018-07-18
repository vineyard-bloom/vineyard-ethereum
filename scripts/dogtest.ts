import { StatsD } from 'hot-shots'
const dogstatsd = new StatsD()

// Test Metrics
dogstatsd.increment('geth.rpc.gettransactionreceipt')
dogstatsd.increment('geth.rpc.getblock')
dogstatsd.increment('geth.rpc.getblocknumber')
dogstatsd.increment('geth.rpc.getlogs')
console.log('done')
// check in metrics explorer on datadog