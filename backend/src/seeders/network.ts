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
      const exist = await Network.find();

      if (exist.length === 0) {
        Network.create([
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
        ]);
      }
    } catch (error) {
      console.log("Error", error);
    }
  }
}

export const netowkSeed = new NetowkSeed();
