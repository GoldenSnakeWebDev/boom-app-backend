import { Schema, model } from "mongoose";

export interface IBoomVersion {
    boom?: string;
    minted_versions?: number;
    is_active?: boolean
}

const boomVersionSchema = new Schema<IBoomVersion>(
    {
        minted_versions: { type: Schema.Types.Number, default: 0 },
        boom: { type: Schema.Types.ObjectId, ref: "Boom" },
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

export const BoomVersion = model("BoomVersion", boomVersionSchema);
