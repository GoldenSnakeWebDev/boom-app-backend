import { Schema, model } from "mongoose";
import { PasswordManager } from "../utils/password-manager";
import { UserType } from "../types/user";

interface IUser {
  first_name?: string;
  last_name?: string;
  booms?: Array<Schema.Types.ObjectId>;
  blocked_users?: Array<Schema.Types.ObjectId>;
  rebooms?: Array<Schema.Types.ObjectId>;
  friends?: Array<Schema.Types.ObjectId>;
  funs?: Array<Schema.Types.ObjectId>;
  sync_bank?: Schema.Types.ObjectId;
  device_id?: string;
  photo?: string;
  cover?: string;
  email: string;
  location?: string;
  password_reset?: {
    is_changed?: boolean;
    token?: string;
  };
  password_reset_token?: string;
  is_admin?: boolean;
  bio?: string;
  tipping_info?: Array<{
    network: string;
    address: string;
  }>;
  username?: string;
  password: string;
  user_type?: string;
  is_active?: boolean;
  social_media?: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    telegram?: string;
    discord?: string;
    medium?: string;
  };
}

const userSchema = new Schema<IUser>(
  {
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    username: { type: String, default: "" },
    photo: { type: String, default: "" },
    cover: { type: String, default: "" },
    email: { type: String, default: "" },
    bio: { type: String, default: "" },
    device_id: { type: String, default: "" },
    location: { type: String, default: "" },
    sync_bank: { type: Schema.Types.ObjectId, ref: "SyncBank" },
    user_type: {
      type: String,
      enum: {
        values: Object.values(UserType),
        message: `user type can only be the following: ${Object.values(
          UserType
        ).join(",")}`,
      },
      default: UserType.NORAMAL,
    },
    tipping_info: [{
      network: { type: Schema.Types.ObjectId, ref: "Network" },
      address: { type: Schema.Types.String, default: "" }
    }],
    booms: [{ type: Schema.Types.ObjectId, ref: "BoomBox" }],
    blocked_users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    rebooms: [{ type: Schema.Types.ObjectId, ref: "Boom" }],
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    funs: [{ type: Schema.Types.ObjectId, ref: "User" }],
    password_reset: {
      is_changed: { type: Schema.Types.Boolean, default: false },
    },
    social_media: {
      twitter: { type: Schema.Types.String, default: "" },
      instagram: { type: Schema.Types.String, default: "" },
      tiktok: { type: Schema.Types.String, default: "" },
      facebook: { type: Schema.Types.String, default: "" },
      telegram: { type: Schema.Types.String, default: "" },
      discord: { type: Schema.Types.String, default: "" },
      medium: { type: Schema.Types.String, default: "" },
    },
    is_active: { type: Schema.Types.Boolean, default: true },
    is_admin: { type: Schema.Types.Boolean, default: false },
    password_reset_token: { type: String, default: "" },
    password: { type: String, default: "" },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        delete ret.following;
        delete ret.followers;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await PasswordManager.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

export const User = model("User", userSchema);
