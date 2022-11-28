import { Schema, model, Types } from "mongoose";
import { User } from "./user";

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
    boom: { type: Schema.Types.ObjectId, ref: "Boom" },
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

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    model: User,
    select: "username photo first_name last_name",
  });
  next();
});
export const Comment = model("Comment", commentSchema);
