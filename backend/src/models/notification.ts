import { Schema, model, Types } from "mongoose";

export enum NotificationType {
  MINTING = "minting",
  FOLLOWER = "follower",
  BOOM_CREATED = "boom created",
}

export interface INotification {
  user?: Types.ObjectId;
  message: string;
  boom?: string;
  notofication_type: NotificationType;
  is_read?: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    boom: { type: Schema.Types.ObjectId, ref: "Boom" },
    notofication_type: {
      type: Schema.Types.String,
      default: NotificationType.MINTING,
      enum: {
        values: Object.values(NotificationType),
        message: `Notification types can only be ${Object.values(
          NotificationType
        ).join(",")}`,
      },
    },
    is_read: { type: Schema.Types.Boolean, default: false },
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

export const Nofitication = model("Notification", notificationSchema);
