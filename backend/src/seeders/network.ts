import { SeedHelper } from "./seed-helper";
import { config } from "../config";
import { Network } from "../models";
export class NetowkSeed extends SeedHelper {
  constructor() {
    super(config.DB_URL);
    // must call this
    Object.setPrototypeOf(this, NetowkSeed.prototype);
  }

  /**
   * Actual seeding
   */
  async seed() {
    try {
      const networkList = [
        {
          name: "Binance Smart Chain",
          image_url:
            "https://bin.bnbstatic.com/static/images/common/favicon.ico",
          symbol: "BNB",
        },
        {
          name: "Tezos",
          image_url: "https://lh3.googleusercontent.com/pw/AJFCJaXTz7aHCa5ppryvbsUU7K6hvfLD6zO4gdwfNor3RsBeqB_jZQI6GX09WXY2Q7Tbfj5C6lmXRuiMsT7PxYKxFHz0hL-uJC6dCq0_z6w-gW7khuYOm6DD7rluwcUQVClB7AGEF7YaYLn87my0I5Y7XwKDLA=w805-h988-s-no?authuser=0",
          symbol: "TZ",
        },
        {
          name: "polygon(Matic)",
          image_url: "https://lh3.googleusercontent.com/pw/AJFCJaVIpWecFNGNX89IyIvgoZ9VYEcYLriuEnJxMWl3mln-frvHFYGe1_11ZFXahnKvnztnc8INIzhcBFoJMark30fXILSNMJ2wXmtvdCuUgvkgzKNVWbUbF_7wIampel94SXl8zV8ERs_X6lq0fnuS_hSxWg=w512-h512-s-no?authuser=0",
          symbol: "MATIC",
        },
        {
          name: "OKT Chain",
          image_url:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/8267.png",
          symbol: "OKT",
        },
      ];

      networkList.forEach(
        async (item: { name: string; image_url: string; symbol: string }) => {
          const exists = await Network.findOne({ symbol: item.symbol });
          if (!exists) {
            Network.create(item);
          }
        }
      );
    } catch (error) {
      console.log("Error", error);
    }
  }
}

export const netowkSeed = new NetowkSeed();
