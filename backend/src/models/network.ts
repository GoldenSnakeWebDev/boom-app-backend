import { Schema, model } from "mongoose";

export enum NetworkType {
  POLYGON = "polygon",
  BINANCE = "binance",
  TEZOS = "tezos",
}

export interface INetwork {
  name: string;
  image_url: string;
  symbol: string;
  price?: number;
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
    price: {
      type: Schema.Types.Number,
      default: 0.0,
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
