import { Schema, model } from "mongoose";

export enum MessageType {
  BOOM_BOX = "boombox",
  NORMAL = "normal",
}

export interface IMessage {
  boom_box?: string;
  sender?: string;
  receiver?: string;
  content?: string;
  is_deleted?: boolean;
  created_at?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    boom_box: { type: Schema.Types.ObjectId, ref: "BoomBox" },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    receiver: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: Schema.Types.Mixed, default: "" },
    created_at: { type: Schema.Types.Date, default: Date.now },
    is_deleted: { type: Schema.Types.Boolean, default: true },
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

export const Message = model("Message", messageSchema);
