import { SeedHelper } from "./seed-helper";
import { config } from "../config";
import { Product } from "../models";
export class StripeProductSeed extends SeedHelper {
  constructor() {
    super(config.DB_URL);
    // must call this
    Object.setPrototypeOf(this, StripeProductSeed.prototype);
  }

  /**
   * Actual seeding
   */
  async seed() {
    try {
      const exist = await Product.find();

      if (exist.length === 0) {
        Product.create([
          {
            name: "Basic Package",
            description: "Basic Package",
            price_in_cents: 1000,
          },
          {
            name: "Medium Package",
            description: "Medium package",
            price_in_cents: 2000,
          },
          {
            name: "Prime Package",
            description: "The Prime package for our users",
            price_in_cents: 3000,
          },
        ]);
      }
    } catch (error) {
      console.log("Error", error);
    }
  }
}

export const stripeProductSeed = new StripeProductSeed();
