import { netowkSeed } from "./network";
import { superAdminSeed } from "./admin";

export const seed = async () => {
  //seed admin for the platform
  await netowkSeed.seed();
  await superAdminSeed.seed();
  //seed records
};
