import { Schema, model, Types } from "mongoose";

export interface IComment {
  user: Types.ObjectId;
  boom: Types.ObjectId;
  message?: string;
  created_at?: Date;
  is_active?: boolean;
}

const commentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    message: {
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

export const Comment = model("Comment", commentSchema);
