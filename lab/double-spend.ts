import {GethNode} from "./"
const gethNode1 = new GethNode()
const gethNode2 = new GethNode()

gethNode1.doubleSpend().then(result => console.log(result))
gethNode2.doubleSpend().then(result => console.log(result))