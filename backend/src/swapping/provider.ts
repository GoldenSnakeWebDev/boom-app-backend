import { ethers } from "ethers";
import { config } from "./../config";
export class Web3Provider {
  provider: ethers.providers.JsonRpcProvider;
  RPC: string = config.RPC_URL;
  privateKey: string = config.PRIVATE_KEY;

  get getProvider() {
    return this.provider;
  }

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(this.RPC);
    this.RPC = "";
    this.privateKey = "";
  }

  get authWallet() {
    return new ethers.Wallet(this.privateKey, this.getProvider);
  }
}

export const web3Provider = new Web3Provider();
