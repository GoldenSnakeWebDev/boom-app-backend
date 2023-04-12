import { Schema, model } from "mongoose";

export enum BoomBoxType {
  PRIVATE = "private",
  PUBLIC = "public",
}

export interface IBoomBox {
  box_type?: string;
  image_url?: string;
  label: string;
  members?: Array<{
    user: string;
    is_burnt: boolean;
    is_admin: boolean;
    created_at?: Date;
  }>;
  user?: string;
  created_at: Date;
  is_active?: boolean;
  is_deleted?: boolean;
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
    image_url: { type: Schema.Types.String, default: "" },
    label: { type: Schema.Types.String, default: "" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        created_at: { type: Schema.Types.Date, default: Date.now },
        is_admin: { type: Schema.Types.Boolean, default: false },
        is_burnt: { type: Schema.Types.Boolean, default: false },
      },
    ],
    created_at: { type: Schema.Types.Date, default: Date.now },

    is_active: { type: Schema.Types.Boolean, default: true },
    is_deleted: { type: Schema.Types.Boolean, default: false },
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
