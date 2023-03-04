import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
// get the current app Environment
const appEnv = process.env.APP_ENV! === 'testing' ? `development` : `production`
/**
 * Configuration
 */
export const config = {
  JWT_KEY: process.env.JWT_KEY!,
  DB_URL: process.env.DB_URL!,
  PRIVATE_KEY: process.env.PRIVATE_KEY!,
  PUBLIC_KEY: process.env.PUBLIC_KEY!,
  RPC_URL: process.env.RPC_URL!,
  PORT: process.env.PORT!,
  ENVIRONMENT: appEnv,
  FOLDER_NAME: 'uploads',
  MAIL: {
    SEND_GRID: process.env.MAIL_SEND_GRID_SECRET!,
    SENDER: process.env.MAIL_SEND_GRID_SENDER!,
  },
  PUSH_NOTIFICATION: {
    ON_SIGNAL_REST_API_KEY: process.env.ON_SIGNAL_REST_API_KEY!,
    ON_SIGNAL_APP_ID: process.env.ON_SIGNAL_APP_ID!,
  },
  EXCHANGE: {
    V2_ADDRESS: process.env.PANCAKE_V2_ROUTER_ADDR!,
    PANCAKE_ADDRESS: {
      TEZOS:
        appEnv === `development`
          ? '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c'
          : process.env.TZX_ADDR!,
      BNB:
        appEnv === `development`
          ? '0x764a0cd6a16e9cdeb20fb0820a3d58f5ef7d2daa'
          : process.env.BNB_ADDR!,
      MATIC:
        appEnv === `development`
          ? '0xd41fdb03ba84762dd66a0af1a6c8540ff1ba5dfb'
          : process.env.MATIC_ADDR!,
    },
    TREASURY_TOKEN:
      appEnv === `development`
        ? '0x65afadd39029741b3b8f0756952c74678c9cec93'
        : process.env.TREASURY_USDT_ADDR!,
  },
  STRIPE: {
    SK: process.env.STRIPE_SK!,
    PK: process.env.STRIPE_PK!,
  },
  PAYPAL: {
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID!,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET!,
    PAYPAL_CLIENT_ENV: process.env.PAYPAL_CLIENT_ENV!,
  },
  SERVER_URL: process.env.SERVER_URL!,
  PINATA_API_KEY: process.env.PINATA_API_KEY!,
  PINATA_SECRET_API_KEY: process.env.PINATA_SECRET_API_KEY!,
}
