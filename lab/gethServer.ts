const child_process = require('child_process')

enum Status {
  inactive,
  active
}

function waitUntilRunning() {
  return new Promise<void>((resolve, reject) => {
    const poll = () => {
          console.log('Geth is now running')
          resolve()
        }
    setTimeout(poll, 10000)
  })
}

export class GethServer {
  private status: Status = Status.inactive
  private stdout: any
  private stderr: any
  private childProcess: any

  start() {
    console.log('Starting Geth')
    // const childProcess = this.childProcess = child_process.exec('geth --datadir=~/myBlockchain/node1 --networkid 100 --identity node1 --rpc --rpcport 8545 --rpcapi=\"db,eth,net,web3,personal,web3\" --keystore ./keystores console')
      const childProcess = this.childProcess = child_process.exec('node scripts/all')

    childProcess.stdout.on('data', (data: any) => {
      console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on('data', (data: any) => {
      console.error(`stderr: ${data}`);
    });

    childProcess.on('close', (code: any) => {
      console.log(`child process exited with code ${code}`);
    })

    return waitUntilRunning()
  }

  stop() {
    if (!this.childProcess)
      return Promise.resolve()

    return new Promise((resolve, reject) => {
      this.childProcess.kill()
      this.childProcess.on('close', (code: any) => {
        resolve()
      })
    })

  }
}