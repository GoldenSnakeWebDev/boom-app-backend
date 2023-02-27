import { Schema, Types, model } from "mongoose";

export enum ITransactionPaymentStatus {
  PAID = "paid",
  UNPAID = "unpaid",
  DUE = "due",
}

export enum ITransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FINAL = "final",
  ORDERED = "ordered",
}

export enum ITransactionType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
  INCOME = "income",
  REFUND = "refund",
}

export enum ITransactionPaymentMethod {
  WALLET = "wallet",
  CARD = "card",
  CRYPTO = "sync",
}

export interface ITransaction {
  transaction_number: string;
  user: Types.ObjectId;
  payment_method?: ITransactionPaymentStatus;
  transaction_type?: ITransactionType;
  amount: string;
  phone?: string;
  status?: ITransactionStatus;
  narration?: string;
  transaction_date?: Date;
  stripeActions?: string;
  stripeId?: string;
}

const transactionSchema = new Schema<ITransaction>(
  {
    transaction_number: { type: Schema.Types.String, default: "" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    payment_method: {
      type: Schema.Types.String,
      enum: {
        values: Object.values(ITransactionPaymentStatus),
        message: `Transaction Payment Method can only ${Object.values(
          ITransactionPaymentStatus
        ).join(",")}`,
        default: ITransactionPaymentStatus.UNPAID,
      },
    },
    transaction_type: {
      type: Schema.Types.String,
      enum: {
        values: Object.values(ITransactionType),
        message: `Transaction Type can only ${Object.values(
          ITransactionType
        ).join(",")}`,
        default: ITransactionType.DEPOSIT,
      },
    },
    amount: { type: Schema.Types.String, default: "" },
    phone: { type: Schema.Types.String, default: "" },
    status: {
      type: Schema.Types.String,
      enum: {
        values: Object.values(ITransactionStatus),
        message: `Transaction Type can only ${Object.values(
          ITransactionStatus
        ).join(",")}`,
        default: ITransactionStatus.FINAL,
      },
    },
    stripeId: { type: Schema.Types.String, default: "" },
    stripeActions: { type: Schema.Types.String, default: "" },
    narration: { type: Schema.Types.String, default: "" },
    transaction_date: { type: Schema.Types.Date, default: Date.now },
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

export const Transaction = model("Transaction", transactionSchema);
