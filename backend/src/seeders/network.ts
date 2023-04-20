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
          image_url: "https://tezos.com/favicon-16x16.png",
          symbol: "TZ",
        },
        {
          name: "polygon(Matic)",
          image_url: "https://polygon.technology/favicon-32x32.png",
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
