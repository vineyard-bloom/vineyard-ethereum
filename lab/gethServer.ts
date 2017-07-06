const child_process = require('child_process')

enum Status {
  inactive,
  active
}

function waitUntilRunning() {
  return new Promise<void>((resolve, reject) => {
    const poll = () => {
      child_process.exec('geth attach ipc://var/folders/xz/6z9mwmy12gnbnfc1pb52qwmw0000gn/T/ethereum_dev_mode/geth.ipc', function (error, stdout, stderr) {
        if (error) {
          // console.log('not yet', stderr)
          setTimeout(poll, 100)
        }
        else {
          console.log('Geth is now running')
          resolve()
        }
      })
    }

    setTimeout(poll, 3000)
  })
}

export class GethServer {
  private status: Status = Status.inactive
  private stdout
  private stderr
  private childProcess

  start() {
    console.log('Starting Geth')
    const childProcess = this.childProcess = child_process.exec('geth --dev --rpc --rpcport 8545 --rpcapi=\"db,eth,net,web3,personal,web3\" --keystore ./keystores --mine --minerthreads=1 --etherbase=0xf914f8403f9682d427328622f419cb86414ee8ca console')

    childProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    childProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    })

    return waitUntilRunning()
  }

  stop() {
    if (!this.childProcess)
      return Promise.resolve()

    return new Promise((resolve, reject) => {
      this.childProcess.kill()
      this.childProcess.on('close', (code) => {
        resolve()
      })
    })

  }
}