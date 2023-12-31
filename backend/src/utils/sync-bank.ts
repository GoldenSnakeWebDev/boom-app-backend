import {
  SyncBank,
  SyncBankType,
  User,
  Transaction,
  ITransactionType,
  NotificationType,
  Notification,
  NetworkType,
} from "../models";
import { config } from "../config";
import { getNextTransaction } from "./transaction-common";

export const createSyncBankForNewUser = async (opts: {
  user: string;
  wallet_type: SyncBankType;
}) => {
  try {
    const wallet = await SyncBank.create({
      wallet_type: opts.wallet_type,
      user: opts.user,
      syncID: `BM/${Date.now()}`,
      tezos: {
        amount_in: config.ENVIRONMENT === "development" ? 2000 : 0.0,
        amount_balance: config.ENVIRONMENT === "development" ? 2000 : 0.0,
        amount_out: 0,
      },
      binance: {
        amount_in: config.ENVIRONMENT === "development" ? 2000 : 0.0,
        amount_balance: config.ENVIRONMENT === "development" ? 2000 : 0.0,
        amount_out: 0,
      },
      polygon: {
        amount_in: config.ENVIRONMENT === "development" ? 2000 : 0.0,
        amount_balance: config.ENVIRONMENT === "development" ? 2000 : 0.0,
        amount_out: 0,
      },
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
  networkType: NetworkType;
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

  if (opts.networkType === NetworkType.BINANCE) {
    if (opts.transaction_type === ITransactionType.WITHDRAW) {
      // decrement wallet balance

      syncBank.binance!.amount_balance =
        Number(syncBank.binance?.amount_balance!) - Number(opts.amount);
      syncBank.binance!.amount_out =
        Number(syncBank.binance?.amount_out!) - Number(opts.amount);
      // save code
      await syncBank.save();

      // create transactions
      await Transaction.create({
        user: user.id,
        transaction_number: await getNextTransaction(),
        amount: Number(opts.amount),
        transaction_type: opts.transaction_type,
        narations: `Updated you wallet balance`,
        phone: `+${user.email}`,
        status: "success",
      });
    }
    if (opts.transaction_type === ITransactionType.DEPOSIT) {
      // increment wallet balance
      syncBank.binance!.amount_balance =
        Number(syncBank.binance!.amount_balance!) + Number(opts.amount);
      syncBank.binance!.amount_in =
        Number(syncBank.binance!.amount_in!) + Number(opts.amount);
      // save code
      await syncBank.save();
      // create transactions
      await Transaction.create({
        user: user.id,
        transaction_number: await getNextTransaction(),
        amount: Number(opts.amount),
        transaction_type: opts.transaction_type,
        narations: `Updated you wallet balance`,
        phone: `+${user.email}`,
        status: "success",
      });
    }

    if (opts.transaction_type === ITransactionType.TRANSFER) {
      syncBank.binance!.amount_balance =
        Number(syncBank.binance!.amount_balance!) - Number(opts.amount);
      syncBank.binance!.amount_out =
        Number(syncBank.binance!.amount_out!) - Number(opts.amount);
      // save code
      await syncBank.save();
      // create transactions
      await Transaction.create({
        user: user.id,
        transaction_number: await getNextTransaction(),
        amount: Number(opts.amount),
        transaction_type: opts.transaction_type,
        narations: `Transfered you money from your wallet`,
        phone: `+${user.email}`,
        status: "success",
      });
    }
    if (opts.transaction_type === ITransactionType.INCOME) {
      // increment wallet balance
      syncBank.binance!.amount_balance =
        Number(syncBank.binance!.amount_balance!) + Number(opts.amount);
      syncBank.binance!.amount_in =
        Number(syncBank.binance!.amount_in!) + Number(opts.amount);
      // save code
      await syncBank.save();
      // create transactions
      await Transaction.create({
        user: user.id,
        transaction_number: await getNextTransaction(),
        amount: Number(opts.amount),
        transaction_type: opts.transaction_type,
        narations: `Recieved money from your friend`,
        phone: `+${user.email}`,
        status: "success",
      });
    }
  } else if (opts.networkType === NetworkType.POLYGON) {
    if (opts.transaction_type === ITransactionType.WITHDRAW) {
      // decrement wallet balance

      syncBank.polygon!.amount_balance =
        Number(syncBank.polygon?.amount_balance!) - Number(opts.amount);
      syncBank.polygon!.amount_out =
        Number(syncBank.polygon?.amount_out!) - Number(opts.amount);
      // save code
      await syncBank.save();

      // create transactions
      await Transaction.create({
        user: user.id,
        transaction_number: await getNextTransaction(),
        amount: Number(opts.amount),
        transaction_type: opts.transaction_type,
        narations: `Updated you wallet balance`,
        phone: `+${user.email}`,
        status: "success",
      });
    }
    if (opts.transaction_type === ITransactionType.DEPOSIT) {
      // increment wallet balance
      syncBank.polygon!.amount_balance =
        Number(syncBank.polygon!.amount_balance!) + Number(opts.amount);
      syncBank.polygon!.amount_in =
        Number(syncBank.polygon!.amount_in!) + Number(opts.amount);
      // save code
      await syncBank.save();
      // create transactions
      await Transaction.create({
        user: user.id,
        transaction_number: await getNextTransaction(),
        amount: Number(opts.amount),
        transaction_type: opts.transaction_type,
        narations: `Updated you wallet balance`,
        phone: `+${user.email}`,
        status: "success",
      });
    }

    if (opts.transaction_type === ITransactionType.TRANSFER) {
      syncBank.polygon!.amount_balance =
        Number(syncBank.polygon!.amount_balance!) - Number(opts.amount);
      syncBank.polygon!.amount_out =
        Number(syncBank.polygon!.amount_out!) - Number(opts.amount);
      // save code
      await syncBank.save();
      // create transactions
      await Transaction.create({
        user: user.id,
        transaction_number: await getNextTransaction(),
        amount: Number(opts.amount),
        transaction_type: opts.transaction_type,
        narations: `Transfered you money from your wallet`,
        phone: `+${user.email}`,
        status: "success",
      });
    }
    if (opts.transaction_type === ITransactionType.INCOME) {
      // increment wallet balance
      syncBank.polygon!.amount_balance =
        syncBank.polygon!.amount_balance! + Number(opts.amount);
      syncBank.polygon!.amount_in =
        syncBank.polygon!.amount_in! + Number(opts.amount);
      // save code
      await syncBank.save();
      // create transactions
      await Transaction.create({
        user: user.id,
        transaction_number: await getNextTransaction(),
        amount: Number(opts.amount),
        transaction_type: opts.transaction_type,
        narations: `Recieved money from your friend`,
        phone: `+${user.email}`,
        status: "success",
      });
    }
  } else if (opts.networkType === NetworkType.TEZOS) {
    if (opts.transaction_type === ITransactionType.WITHDRAW) {
      // decrement wallet balance

      syncBank.tezos!.amount_balance =
        Number(syncBank.tezos?.amount_balance!) - Number(opts.amount);
      syncBank.tezos!.amount_out =
        Number(syncBank.tezos?.amount_out!) - Number(opts.amount);
      // save code
      await syncBank.save();

      // create transactions
      await Transaction.create({
        user: user.id,
        transaction_number: await getNextTransaction(),
        amount: Number(opts.amount),
        transaction_type: opts.transaction_type,
        narations: `Updated you wallet balance`,
        phone: `+${user.email}`,
        status: "success",
      });
    }
    if (opts.transaction_type === ITransactionType.DEPOSIT) {
      // increment wallet balance
      syncBank.tezos!.amount_balance =
        Number(syncBank.tezos!.amount_balance!) + Number(opts.amount);
      syncBank.tezos!.amount_in =
        Number(syncBank.tezos!.amount_in!) + Number(opts.amount);
      // save code
      await syncBank.save();
      // create transactions
      await Transaction.create({
        user: user.id,
        transaction_number: await getNextTransaction(),
        amount: Number(opts.amount),
        transaction_type: opts.transaction_type,
        narations: `Updated you wallet balance`,
        phone: `+${user.email}`,
        status: "success",
      });
    }

    if (opts.transaction_type === ITransactionType.TRANSFER) {
      syncBank.tezos!.amount_balance =
        Number(syncBank.tezos!.amount_balance!) - Number(opts.amount);
      syncBank.tezos!.amount_out =
        Number(syncBank.tezos!.amount_out!) - Number(opts.amount);
      // save code
      await syncBank.save();
      // create transactions
      await Transaction.create({
        user: user.id,
        transaction_number: await getNextTransaction(),
        amount: Number(opts.amount),
        transaction_type: opts.transaction_type,
        narations: `Transfered you money from your wallet`,
        phone: `+${user.email}`,
        status: "success",
      });
    }
    if (opts.transaction_type === ITransactionType.INCOME) {
      // increment wallet balance
      syncBank.tezos!.amount_balance =
        Number(syncBank.tezos!.amount_balance!) + Number(opts.amount);
      syncBank.tezos!.amount_in =
        Number(syncBank.tezos!.amount_in!) + Number(opts.amount);
      // save code
      await syncBank.save();
      // create transactions
      await Transaction.create({
        user: user.id,
        transaction_number: await getNextTransaction(),
        amount: Number(opts.amount),
        transaction_type: opts.transaction_type,
        narations: `Recieved money from your friend`,
        phone: `+${user.email}`,
        status: "success",
      });
    }
  }

  // create a notification for updating the wallet balance
  const notification = new Notification({
    user: opts.userId,
    notification_type:
      opts.transaction_type === ITransactionType.DEPOSIT ||
      opts.transaction_type === ITransactionType.INCOME
        ? NotificationType.TRANSFER
        : NotificationType.TRANSFER,
    message: `You have made ${opts.transaction_type}`,
  });

  await notification.save();
  return {
    error: "",
    success: true,
    message: `You have made a ${opts.transaction_type}`,
  };
};
