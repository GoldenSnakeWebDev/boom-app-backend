import { Schema, model, Types } from "mongoose";

export enum BoomBoxType {
  PRIVATE = "private",
  PUBLIC = "public",
}

export interface IBoomBox {
  box?: string;
  box_type?: string;
  messages?: Array<{
    content: string;
    author: Types.ObjectId;
    receiver: Types.ObjectId;
    timestamp?: Date;
    is_delete?: boolean;
  }>;
  created_at: Date;
  is_active?: boolean;
}

const boomBoxSchema = new Schema<IBoomBox>(
  {
    box_type: {
      type: Schema.Types.String,
      default: BoomBoxType.PUBLIC,
      enum: {
        values: Object.values(BoomBoxType),
        message: `Boom Box types can only be ${Object.values(BoomBoxType).join(
          ","
        )}`,
      },
    },
    box: { type: Schema.Types.String, default: "" },
    messages: [
      {
        content: { type: Schema.Types.Mixed, default: "" },
        receiver: { type: Schema.Types.ObjectId, ref: "User" },
        author: { type: Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Schema.Types.Date, default: Date.now },
        is_delete: { type: Schema.Types.Boolean, default: false },
      },
    ],
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

export const BoomBox = model("BoomBox", boomBoxSchema);
