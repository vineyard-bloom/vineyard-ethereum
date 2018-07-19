# Vineyard Ethereum

Ethereum transaction monitor

### Mocha Testing Info

Follow these steps for all mocha tests to pass:

  1. In the project root, create the folder `temp`, and then the folder `temp/eth`.
  1. In the `test/config` folder, copy the file `config-sample.json` and rename it `config.json`.
  1. Ensure there is a working geth endpoint as the `http` value in `config.json`. (If you do not have access to a geth endpoint, do not despair. Most of the tests will still pass.)
