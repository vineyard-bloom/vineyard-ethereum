import {GethNode, GethNodeConfig} from "./geth-node";

export class EthereumNetwork {
  private config: GethNodeConfig
  nextPort = 8546

  constructor(config: GethNodeConfig) {
    this.config = config;
  }

  createNode() {
    return new GethNode(this.config, this.nextPort++)
  }
}