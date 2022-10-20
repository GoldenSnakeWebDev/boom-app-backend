import dotenv from "dotenv";
dotenv.config();

export const config = {
  JWT_KEY: "5df0492d6f52c3a7d158da79f1e70d3bc5aa179a",
  DB_URL: "mongodb://localhost:27017/boom-dev",
  PRIVATE_KEY: process.env.PRIVATE_KEY!,
  RPC_URL: process.env.RPC_URL!,
};
