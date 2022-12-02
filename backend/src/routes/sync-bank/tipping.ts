import { Response, Request, Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../../middlewares/require-auth";
import { updateWalletBalance } from "../../utils/sync-bank";
import {
  Transaction,
  ITransactionType,
  ITransactionStatus,
} from "../../models/transaction";
import { User } from "./../../models/user";

import { getNextTransaction } from "../../utils/transaction-common";
import { BadRequestError } from "../../errors/bad-request-error";
import { NotificationType, Notification } from "./../../models/notification";

const router = Router();

/**
 * @openapi
 * /api/v1/sync-bank/tipping:
 *   post:
 *     tags:
 *        - SyncBank-Tipping
 *     description: Tiping User with some sync coins
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: amount
 *          description: Please provide an amount to deposit
 *        - name: user
 *          description: User informatin Id
 *        - name: networkType
 *          description: The network type you are access from
 *        - name: timestamp
 *          description: Please provide the timestamp
 *     responses:
 *       200:
 *         description: . Return current logged in user sync bank.
 */
router.post(
  "/api/v1/sync-bank/tipping",
  [
    body("amount")
      .notEmpty()
      .withMessage("please provide the amount you are willing to deposit"),
    body("user")
      .notEmpty()
      .withMessage("please provide the user id you are trying to tip"),
    body("networkType")
      .notEmpty()
      .withMessage("please provide  which network are you tipping from"),
  ],
  requireAuth,
  async (req: Request, res: Response) => {
    let { amount, user, networkType, timestamp } = req.body;

    if (timestamp) {
      timestamp = Date.now();
    }

    const tipedUser = await User.findById(user);

    if (!tipedUser) {
      throw new BadRequestError(
        "User you are trying to tip does not exist. Try again"
      );
    }

    const transactionRef = await getNextTransaction();

    const transaction = Transaction.create({
      transaction_number: transactionRef,
      amount,
      user: tipedUser.id!,
      transaction_type: ITransactionType.DEPOSIT,
      status: ITransactionStatus.PENDING,
    });
    //for tiper
    await updateWalletBalance({
      userId: req.currentUser?.id!,
      transaction_type: ITransactionType.TRANSFER,
      amount,
      networkType,
    });

    // send notification for tipper

    await Notification.create({
      notification_type: NotificationType.USER,
      user: req.currentUser?.id,
      message: `Successfully tipped ${tipedUser?.username}`,
      timestamp: new Date(timestamp),
    });

    // after approve that payments have reached to our bank
    const syncBankResponse = await updateWalletBalance({
      userId: tipedUser.id,
      transaction_type: ITransactionType.INCOME,
      amount,
      networkType,
    });
    // end of update sync bank
    // send notification for tipee

    await Notification.create({
      notification_type: NotificationType.USER,
      user: req.currentUser?.id,
      message: `You have been tipped by ${req.currentUser?.username}`,
      timestamp: new Date(timestamp),
    });

    res.status(200).json({
      status: "success",
      transaction,
      message: syncBankResponse.message,
    });
  }
);

export { router as TippingRoute };
