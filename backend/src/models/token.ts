import { Schema, model } from "mongoose";

interface IToken {
    token: string;
    user?: string;
    created_at?: Date;
    is_active?: boolean;
    is_deleted?: boolean
}


const tokenSchema = new Schema<IToken>({
    token: { type: Schema.Types.String, default: "" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    is_active: { type: Schema.Types.Boolean, default: true },
    is_deleted: { type: Schema.Types.Boolean, default: false },
    created_at: { type: Schema.Types.Date, default: Date.now }
}, {
    toJSON: {
        transform(_doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
});

export const Token = model("Token", tokenSchema);
