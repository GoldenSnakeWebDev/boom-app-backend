import { Schema, model } from "mongoose";

export interface IProduct {
  name: string;
  description?: string;
  price_in_cents: number;
  is_active?: boolean;
}

const ptroductSchema = new Schema<IProduct>(
  {
    name: {
      type: Schema.Types.String,
      default: "",
    },
    price_in_cents: { type: Schema.Types.Number, default: 0 },
    description: {
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

export const Product = model("Product", ptroductSchema);
