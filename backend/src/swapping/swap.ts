// import { web3Provider } from "./provider";
import { ethers } from "ethers";
import { readFileSync } from "fs";

export class V2PancakeSwap {
  address: string = "";

  get contract() {
    return new ethers.Contract(
      this.address,
      JSON.parse(
        readFileSync(`${__dirname}/../abis/V2PancakeSwap.json`, "utf-8")
      )
    );
  }

  /**
   * Swap USDT asset for a new assets
   * Buy BNB
   */
  swap() {}
}

export const v2PancakeSwap = new V2PancakeSwap();
