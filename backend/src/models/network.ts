import { Schema, model } from "mongoose";

export enum NetworkType {
  POLYGON = "MATIC",
  BINANCE = "BNB",
  TEZOS = "TZ",
  OK_COIN = "OKT",
}

export interface INetwork {
  name: string;
  image_url: string;
  symbol: string;
  is_active?: boolean;
}

const networkSchema = new Schema<INetwork>(
  {
    name: {
      type: Schema.Types.String,
      default: "",
    },
    image_url: {
      type: Schema.Types.String,
      default: "",
    },
    symbol: {
      type: Schema.Types.String,
      default: "",
    },
    is_active: { type: Schema.Types.Boolean, default: true },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const Network = model("Network", networkSchema);
