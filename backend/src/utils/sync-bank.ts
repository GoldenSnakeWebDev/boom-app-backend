import { SyncBank, SyncBankType } from "../models/syncbank";
import { User } from "./../models/user";
import { ITransactionType, Transaction } from "./../models/transaction";
import { config } from "../config";
import { getNextTransaction } from "./transaction-common";
import { Nofitication, NotificationType } from "./../models/notification";

export const createSyncBankForNewUser = async (opts: {
  user: string;
  wallet_type: SyncBankType;
}) => {
  try {
    const wallet = await SyncBank.create({
      wallet_type: opts.wallet_type,
      user: opts.user,
      syncID: `BM/${Date.now()}`,
      amount_in: config.ENVIRONMENT === "development" ? 1000 : 0.0,
      amount_balance: config.ENVIRONMENT === "development" ? 1000 : 0.0,
      amount_out: 0,
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
}) => {
  let message = "";

  const user = await User.findById(opts.userId);

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

    syncBank.amount_balance = syncBank.amount_balance! - opts.amount;
    syncBank.amount_out = syncBank.amount_out! - opts.amount;
    // save code
    await syncBank.save();

    // create transactions
    await Transaction.create({
      user: user.id,
      transactionId: await getNextTransaction(),
      amount: opts.amount,
      transaction_type: opts.transaction_type,
      narations: `Updated you wallet balance`,
      phone: `+${user.email}`,
      status: "success",
    });
  }
  if (opts.transaction_type === ITransactionType.DEPOSIT) {
    // increment wallet balance
    syncBank.amount_balance = syncBank.amount_balance! + opts.amount;
    syncBank.amount_in = syncBank.amount_in! + opts.amount;
    // save code
    await syncBank.save();
    // create transactions
    await Transaction.create({
      user: user.id,
      transactionId: await getNextTransaction(),
      amount: opts.amount,
      transaction_type: opts.transaction_type,
      narations: `Updated you wallet balance`,
      phone: `+${user.email}`,
      status: "success",
    });
  }

  if (opts.transaction_type === ITransactionType.TRANSFER) {
    syncBank.amount_balance = syncBank.amount_balance! - opts.amount;
    syncBank.amount_out = syncBank.amount_out! - opts.amount;
    // save code
    await syncBank.save();
    // create transactions
    await Transaction.create({
      user: user.id,
      transactionId: await getNextTransaction(),
      amount: opts.amount,
      transaction_type: opts.transaction_type,
      narations: `Transfered you money from your wallet`,
      phone: `+${user.email}`,
      status: "success",
    });
  }
  if (opts.transaction_type === ITransactionType.INCOME) {
    // increment wallet balance
    syncBank.amount_balance = syncBank.amount_balance! + opts.amount;
    syncBank.amount_in = syncBank.amount_in! + opts.amount;
    // save code
    await syncBank.save();
    // create transactions
    await Transaction.create({
      user: user.id,
      transactionId: await getNextTransaction(),
      amount: opts.amount,
      transaction_type: opts.transaction_type,
      narations: `Recieved money from your friend`,
      phone: `+${user.email}`,
      status: "success",
    });
  }

  // create a notification for updating the wallet balance
  const notification = new Nofitication({
    user: opts.userId,
    notofication_type:
      opts.transaction_type === ITransactionType.DEPOSIT ||
      opts.transaction_type === ITransactionType.INCOME
        ? NotificationType.TRANSFER
        : NotificationType.MINTING,
    message: `You have made ${opts.transaction_type}`,
  });

  await notification.save();
  return { error: "", success: true, message };
};
