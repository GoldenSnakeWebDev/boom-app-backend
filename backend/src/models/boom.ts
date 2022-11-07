import { Schema, model, Types } from "mongoose";

export enum BoomType {
  TEXT = "text",
  VIDEO = "video",
  NORMAL = "image",
}

export enum BoomState {
  REAL_NFT = "realnft",
  SYNTHETIC = "synthetic",
  UPLOAD = "upload",
}

export interface IBoom {
  boom_type: BoomType;
  quantity?: number;
  fixed_price?: number;
  title: string;
  description?: string;
  is_minted?: boolean;
  image_url?: string;
  network: Types.ObjectId;
  comments?: Array<Types.ObjectId>;
  user: Types.ObjectId;
  price?: string;
  reactions?: {
    likes: Array<Types.ObjectId>;
    loves: Array<Types.ObjectId>;
    smiles: Array<Types.ObjectId>;
    rebooms: Array<Types.ObjectId>;
    reports: Array<Types.ObjectId>;
  };
  tags?: Array<string>;
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
    title: { type: Schema.Types.String, default: "" },
    boom_state: { type: Schema.Types.String, default: BoomState.UPLOAD },
    is_minted: { type: Schema.Types.Boolean, default: false },
    description: {
      type: Schema.Types.String,
      default: "",
    },
    network: { type: Schema.Types.ObjectId, ref: "Network" },
    comments: Array<{ type: Schema.Types.ObjectId; ref: "Comment" }>,
    user: { type: Schema.Types.ObjectId, ref: "User" },
    image_url: {
      type: Schema.Types.String,
      default: "",
    },
    reactions: {
      likes: Array<{ type: Schema.Types.ObjectId; ref: "User" }>,
      loves: Array<{ type: Schema.Types.ObjectId; ref: "User" }>,
      smiles: Array<{ type: Schema.Types.ObjectId; ref: "User" }>,
      rebooms: Array<{ type: Schema.Types.ObjectId; ref: "User" }>,
      reports: Array<{ type: Schema.Types.ObjectId; ref: "User" }>,
    },
    price: { type: Schema.Types.String, default: "" },
    fixed_price: { type: Schema.Types.String, default: "" },
    tags: { type: Schema.Types.Array, default: [] },
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
