import { Schema, model } from "mongoose";
import { PasswordManager } from "./../utils/password-manager";
import { UserType } from "../types/user";

interface IUser {
  first_name?: string;
  last_name?: string;
  booms?: Array<Schema.Types.ObjectId>;
  followers?: Array<Schema.Types.ObjectId>;
  following?: Array<Schema.Types.ObjectId>;
  photo?: string;
  email: string;
  location?: string;
  password_reset?: {
    is_changed?: boolean;
    token?: string;
  };
  password_reset_token?: string;
  is_admin?: string;
  bio?: string;
  username?: string;
  password: string;
  user_type?: string;
  is_active?: string;
}

const userSchema = new Schema<IUser>(
  {
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    username: { type: String, default: "" },
    photo: { type: String, default: "" },
    email: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
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
    booms: [{ type: Schema.Types.ObjectId, ref: "BoomBox" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    password_reset: {
      is_changed: { type: Schema.Types.Boolean, default: false },
    },
    is_admin: { type: Schema.Types.Boolean, default: false },
    password_reset_token: { type: String, default: "" },
    password: { type: String, default: "" },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
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
