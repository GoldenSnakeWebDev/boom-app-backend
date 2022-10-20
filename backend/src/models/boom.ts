import { Schema, model, Types } from "mongoose";

export enum BoomType {
  TALE = "tale",
  EPIC = "epic",
  NORMAL = "normal",
}

export enum BoomState {
  REAL_NFT = "realnft",
  SYNTHETIC = "synthetic",
}

export interface IBoom {
  boom_type: BoomType;
  description?: string;
  is_minted?: boolean;
  image_url?: string;
  network: Types.ObjectId;
  user: Types.ObjectId;
  boom_state?: BoomState;
  created_at?: Date;
  is_active?: boolean;
}

const boomSchema = new Schema<IBoom>(
  {
    boom_type: {
      type: Schema.Types.String,
      default: BoomType.NORMAL,
      enum: {
        values: Object.values(BoomType),
        message: `Boom types can only be ${Object.values(BoomType).join(",")}`,
      },
    },
    boom_state: { type: Schema.Types.String, default: BoomState.SYNTHETIC },
    is_minted: { type: Schema.Types.Boolean, default: false },
    description: {
      type: Schema.Types.String,
      default: "",
    },
    network: { type: Schema.Types.ObjectId, ref: "Network" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    image_url: {
      type: Schema.Types.String,
      default: "",
    },
    created_at: { type: Schema.Types.Date, default: Date.now },
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

export const Boom = model("Boom", boomSchema);
