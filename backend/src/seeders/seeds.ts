import { netowkSeed } from "./network";

export const seed = async () => {
  //seed admin for the platform
  await netowkSeed.seed();
  //seed records
};
