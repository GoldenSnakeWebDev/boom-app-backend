import { Schema, Types, model } from "mongoose";

export enum SyncBankType {
  APP = "app",
  USER = "user",
}

export interface ISyncBank {
  syncID?: number;
  tezos?: {
    amount_in?: number;
    amount_out?: number;
    amount_balance?: number;
  };
  binance?: {
    amount_in?: number;
    amount_out?: number;
    amount_balance?: number;
  };

  polygon?: {
    amount_in?: number;
    amount_out?: number;
    amount_balance?: number;
  };
  user?: Types.ObjectId;
  sync_bank_type?: SyncBankType;
  is_active?: boolean;
}

const syncBankSchema = new Schema<ISyncBank>(
  {
    syncID: {
      type: Schema.Types.String,
      unique: true,
    },

    tezos: {
      amount_in: { type: Schema.Types.Number, default: 0.0 },
      amount_out: { type: Schema.Types.Number, default: 0.0 },
      amount_balance: { type: Schema.Types.Number, default: 0.0 },
    },
    binance: {
      amount_in: { type: Schema.Types.Number, default: 0.0 },
      amount_out: { type: Schema.Types.Number, default: 0.0 },
      amount_balance: { type: Schema.Types.Number, default: 0.0 },
    },

    polygon: {
      amount_in: { type: Schema.Types.Number, default: 0.0 },
      amount_out: { type: Schema.Types.Number, default: 0.0 },
      amount_balance: { type: Schema.Types.Number, default: 0.0 },
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    sync_bank_type: {
      type: Schema.Types.String,
      default: SyncBankType.USER,
      enum: {
        values: Object.values(SyncBankType),
        message: `Sync Bank type can only of the following values: ${Object.values(
          SyncBankType
        ).join(",")}`,
      },
    },
    is_active: { type: Schema.Types.Boolean, default: true },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.amount_balance;
        delete ret.amount_in;
        delete ret.amount_out;
      },
    },
  }
);

export const SyncBank = model("SyncBank", syncBankSchema);
