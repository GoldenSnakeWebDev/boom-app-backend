import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { updateWalletBalance } from "../../utils/sync-bank";
import {
  Transaction,
  ITransactionType,
  ITransactionStatus,
} from "../../models/transaction";
import { getNextTransaction } from "../../utils/transaction-common";
import { Notification, NotificationType } from "./../../models/notification";

const router = Router();

export enum ActionType {
  WITHDRAW = "withdraw",
  DEPOSIT = "deposit",
}

/**
 * @openapi
 * /api/v1/callback-urls/google-plays-tore:
 *   post:
 *     tags:
 *        - CallbackUrl
 *     description: Callback URL to access Google plays tore request and response.
 *     produces:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a success message
 */
router.post(
  "/api/v1/callback-urls/google-plays-tore",
  [
    body("amount")
      .notEmpty()
      .withMessage("please provide the amount you are willing to deposit"),
    body("networkType")
      .notEmpty()
      .withMessage(
        "please provide from which network are you withdrawing from"
      ),
    body("actionType")
      .notEmpty()
      .withMessage("please provide the action type e.g deposit/withdraw"),
    body("timestamp").notEmpty().withMessage("please provide timestamp"),
    body("userId").notEmpty().withMessage("please provide timestamp"),
  ],
  async (req: Request, res: Response) => {
    let { amount, networkType, timestamp, actionType } = req.body;

    if (timestamp) {
      timestamp = Date.now();
    }

    const transactionRef = await getNextTransaction();

    const transaction = Transaction.create({
      transaction_number: transactionRef,
      amount,
      user: req.currentUser?.id!,
      transaction_type: ITransactionType.DEPOSIT,
      status: ITransactionStatus.PENDING,
    });

    // after approve that payments have reached to our bank
    const syncBankResponse = await updateWalletBalance({
      userId: req.currentUser?.id!,
      transaction_type:
        actionType === ActionType.DEPOSIT
          ? ITransactionType.DEPOSIT
          : ITransactionType.WITHDRAW,
      amount,
      networkType,
    });

    await Notification.create({
      notification_type: NotificationType.BOOM,
      user: req.currentUser?.id,
      message: `Successfully ${actionType} ${networkType} ${amount}`,
      timestamp: new Date(timestamp),
    });

    res.status(200).json({
      status: "success",
      transaction,
      message: syncBankResponse.message,
    });
  }
);

export { router as CallbackURLRoute };
