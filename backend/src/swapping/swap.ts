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
  async swap(amount: string, asset: string) {
    try {
      const token = Token.getToken(asset);
      const tokenAmountWei = ethers.utils.parseUnits(
        amount,
        await token.decimals()
      );

      const isApproved = await token.approve(this.address, tokenAmountWei, {
        gas: "3000000",
      });

      if (isApproved) {
        const amountOut = await this.contract.getAmountOut(
          tokenAmountWei,
          asset,
          config.EXCHANGE.TREASURY_TOKEN // newToken
        );
        const amounts = await this.contract.swapExactTokensForTokens(
          tokenAmountWei,
          amountOut,
          [config.EXCHANGE.TREASURY_TOKEN, asset],

          web3Provider.authWallet.address,
          new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // plus 1 day
        );

        return {
          success: true,
          error: null,
          amounts,
        };
      }

      return {
        success: false,
        error: null,
        amounts: [],
      };
    } catch (error) {
      // console.log(error);
      return {
        success: false,
        error: null,
        amounts: [],
      };
    }
  }
}

export const v2PancakeSwap = new V2PancakeSwap();
