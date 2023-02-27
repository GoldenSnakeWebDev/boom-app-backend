import { netowkSeed } from "./network";
import { superAdminSeed } from "./admin";
import { stripeProductSeed } from "./stripe";

export const seed = async () => {
  //seed admin for the platform
  await netowkSeed.seed();
  await superAdminSeed.seed();
  await stripeProductSeed.seed();
  //seed records
};
