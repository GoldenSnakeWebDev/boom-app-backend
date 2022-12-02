import { Schema, model, Types } from "mongoose";
import { User } from "./user";
import { Boom } from "./boom";

export enum NotificationType {
  BOOM = "boom",
  USER = "user",
  TRANSFER = "transfer",
}

export interface INotification {
  user?: Types.ObjectId;
  message: string;
  boom?: string;
  notification_type: NotificationType;
  is_read?: boolean;
  timestamp?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    boom: { type: Schema.Types.ObjectId, ref: "Boom" },
    notification_type: {
      type: Schema.Types.String,
      default: NotificationType.USER,
      enum: {
        values: Object.values(NotificationType),
        message: `Notification types can only be ${Object.values(
          NotificationType
        ).join(",")}`,
      },
    },

    message: { type: Schema.Types.String, default: "" },
    is_read: { type: Schema.Types.Boolean, default: false },
    timestamp: { type: Schema.Types.Date, default: Date.now },
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

notificationSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    model: User,
    select: "username photo first_name last_name",
  });
  next();
});

notificationSchema.pre(/^find/, function (next) {
  this.populate({
    path: "boom",
    model: Boom,
    select: "title price ",
  });
  next();
});

export const Notification = model("Notification", notificationSchema);
