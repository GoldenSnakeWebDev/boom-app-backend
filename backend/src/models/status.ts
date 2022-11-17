import { Schema, model, Types } from "mongoose";

export enum StatusType {
  TALE = "tale",
  EPIC = "epic",
}

export interface IStatus {
  status_type: StatusType;
  user: Types.ObjectId;
  views?: Array<Types.ObjectId>;
  image_url?: string;
  expiry_time?: Date;
  created_at?: Date;
  is_active?: boolean;
}

const statusSchema = new Schema<IStatus>(
  {
    status_type: {
      type: Schema.Types.String,
      default: StatusType.EPIC,
      enum: {
        values: Object.values(StatusType),
        message: `Status types can only be ${Object.values(StatusType).join(
          ","
        )}`,
      },
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    image_url: {
      type: Schema.Types.String,
      default: "",
    },
    views: [{ type: Schema.Types.ObjectId, ref: "User" }],
    expiry_time: { type: Schema.Types.String, default: "" },
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

export const Status = model("Status", statusSchema);
