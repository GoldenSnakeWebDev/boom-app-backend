import {Schema, model, Types} from "mongoose"

export interface IReport {
    reporter: Types.ObjectId,
    reported_user: Types.ObjectId,
    message?: string
    timestamp?: Date
}

/**
 * Create Report schema representing mongoose structure that support typescript
 */

const reportSchema  =  new Schema<IReport>({
    reported_user: {type: Schema.Types.ObjectId, ref: "User"},
    reporter: {type: Schema.Types.ObjectId, ref: "User"},
    message: {type:  Schema.Types.String, default: ""},
    timestamp: {type:  Schema.Types.Date,  default:  Date.now}

}, {
    toJSON: {
        transform(_doc, ret) {
            ret.id =  ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});



export const Report  =  model("Report", reportSchema);