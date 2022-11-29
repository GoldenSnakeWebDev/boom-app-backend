// import { web3Provider } from './provider';
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { config } from "../config";
import { web3Provider } from "./provider";
import { Token } from "./token";

export class V2PancakeSwap {
  address: string = config.EXCHANGE.V2_ADDRESS;

  get contract() {
    return new ethers.Contract(
      this.address,
      JSON.parse(
        readFileSync(`${__dirname}/../abis/V2PancakeSwap.json`, "utf-8")
      ),
      web3Provider.authWallet
    );
  }
  /**
   * Swap USDT asset for a new assets
   * Buy BNB
   */
  swap() {}

  async approve(tok: string, amount: string) {
    try {
      const token = Token.getToken(tok);
      const resp = token.approve(this.address, amount, { gas: "3000000" });
      console.log(resp);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "" };
    }
  }
}

export const v2PancakeSwap = new V2PancakeSwap();
