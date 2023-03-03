import dotenv from "dotenv";
dotenv.config({ path: ".env" });

export const config = {
  JWT_KEY: "5df0492d6f52c3a7d158da79f1e70d3bc5aa179a",
  DB_URL: "mongodb://127.0.0.1:27017/boom-dev",
  PRIVATE_KEY: process.env.PRIVATE_KEY!,
  RPC_URL: process.env.RPC_URL!,
  PORT: process.env.PORT!,
  ENVIRONMENT: "development",
  FOLDER_NAME: "uploads",
  MAIL: {
    USER: "dev@kodeace.com",
    PASS: "l;tLrXr7ML#D",
    SEND_GRID:
      "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",
    SENDER: "omambiadauglous@gmail.com",
  },
  PUSH_NOTIFICATION: {
    ON_SIGNAL_REST_API_KEY: "NWU4MmYzYmQtOTJjOS00ZTBiLWEyMzEtZmJiMjM3MjY3NDE2",
    ON_SIGNAL_APP_ID: "d0910db3-e8ff-4418-9365-1a0a494d9615",
  },
  EXCHANGE: {
    V2_ADDRESS: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    PANCAKE_ADDRESS: {
      TEZOS: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      BNB: "0x764a0cd6a16e9cdeb20fb0820a3d58f5ef7d2daa", // BNB Test
      MATIC: "0xd41fdb03ba84762dd66a0af1a6c8540ff1ba5dfb", // BNB Test MATIC
    },
    TREASURY_TOKEN: "0xFa60D973F7642B748046464e165A65B7323b0DEE", //TEST CAKE
  },
  STRIPE: {
    SK: process.env.STRIPE_SK!,
    PK: process.env.STRIPE_PK!,
    ENDPOINT_SECRET: process.env.STRIPE_ENDPPOINT_SECRET!,
  },
  PAYPAL: {
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID!,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET!,
    PAYPAL_CLIENT_ENV: process.env.PAYPAL_CLIENT_ENV!,
  },
  SERVER_URL: process.env.SERVER_URL!,
  PINATA_API_KEY: process.env.PINATA_API_KEY!,
  PINATA_SECRET_API_KEY: process.env.PINATA_SECRET_API_KEY!,
};
