import { SyncBank, SyncBankType } from "../models/syncbank";
import { User } from "./../models/user";
import {
  ITransactionType,
  Transaction,
  ITransactionStatus,
  ITransactionPaymentStatus,
} from "./../models/transaction";
import moment from "moment";

export const createSyncBankForNewUser = async (opts: {
  user: string;
  wallet_type: SyncBankType;
}) => {
  try {
    const wallet = await SyncBank.create({
      wallet_type: opts.wallet_type,
      user: opts.user,
    });

    return { wallet };
  } catch (error) {
    return {
      error: `Error: ${error}`,
    };
  }
};

export const updateWalletBalance = async (opts: {
  userId: string;
  transaction_type: ITransactionType;
  amount: number;
  transactionId: string;
}) => {
  let message = "";

  console.log(opts);

  const user = await User.findById(opts.userId);

  const transaction = await Transaction.findById(opts.transactionId);

  if (!transaction) {
    return {
      error: `(transaction)Error updating wallet balance`,
      success: false,
      message,
    };
  }

  if (!user) {
    return {
      error: `(user)Error updating wallet balance`,
      success: false,
      message,
    };
  }

  const syncBank = await SyncBank.findOne({
    user: opts.userId,
  }).exec();

  if (!syncBank) {
    return {
      error: `(syncBank) Error updating syncBank balance`,
      success: false,
      message,
    };
  }

  if (opts.transaction_type === ITransactionType.WITHDRAW) {
    // decrement wallet balance
    message = `Congraturations. ${user.first_name} ${
      user.last_name
    }, your withdraw transaction of KES.${
      opts.amount
    } on ${moment().format()}. Your new wallet balance if ${
      syncBank.amount_balance
    }`;

    syncBank.amount_balance = syncBank.amount_balance! - opts.amount;
    syncBank.amount_out = syncBank.amount_out! - opts.amount;
    // save code
    await syncBank.save();

    // update transactions
    await Transaction.findByIdAndUpdate(opts.transactionId, {
      status: ITransactionStatus.SUCCESS,
      payment_method: ITransactionPaymentStatus.PAID,
    });
  }
  if (opts.transaction_type === ITransactionType.DEPOSIT) {
    // increment wallet balance
    syncBank.amount_balance = syncBank.amount_balance! + opts.amount;
    syncBank.amount_in = syncBank.amount_in! + opts.amount;
    // save code
    await syncBank.save();
    await Transaction.findByIdAndUpdate(opts.transactionId, {
      status: ITransactionStatus.SUCCESS,
      payment_method: ITransactionPaymentStatus.PAID,
    });

    message = `Congraturations. ${user.first_name} ${
      user.last_name
    }, yout have success deposited to your syncBank with KES. ${
      opts.amount
    } was successfully on ${moment().format()}. Your new syncBank balance if ${
      syncBank.amount_balance
    }`;
  }

  return { error: "", success: true, message };
};
