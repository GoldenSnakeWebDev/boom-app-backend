import { Response, Request, Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../../middlewares/require-auth";
import { updateWalletBalance } from "../../utils/sync-bank";
import {
  Transaction,
  ITransactionType,
  ITransactionStatus,
} from "../../models/transaction";
import { getNextTransaction } from "../../utils/transaction-common";
import { Notification, NotificationType } from "./../../models/notification";
import { onSignalSendNotification } from "./../../utils/on-signal";

const router = Router();

/**
 * @openapi
 * /api/v1/sync-bank/deposit:
 *   post:
 *     tags:
 *        - SyncBank
 *     description: Allows user to deposit to their sync bank
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: amount
 *          description: Please provide an amount to deposit
 *        - name: networkType
 *          description: Please provide which network type you are trying to access
 *     responses:
 *       200:
 *         description: . Returns an update transaction object.
 */
router.post(
  "/api/v1/sync-bank/deposit",
  [
    body("amount")
      .notEmpty()
      .withMessage("please provide the amount you are willing to deposit"),
    body("networkType")
      .notEmpty()
      .withMessage("please provide from which network are you depositing to"),
  ],
  requireAuth,
  async (req: Request, res: Response) => {
    const { amount, networkType } = req.body;

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
      transaction_type: ITransactionType.DEPOSIT,
      amount,
      networkType,
    });

    // automatically

    // buy the assets
    // TODO: Notification
    const msg = `You have successfully bought ${networkType} ${amount}`;
    await Notification.create({
      notification_type: NotificationType.BOOM,
      user: req.currentUser?.id,
      message: msg,
    });

    onSignalSendNotification({
      contents: {
        en: msg,
        es: msg,
      },
      include_external_user_id: [req.currentUser?.device_id!],
      name: `deposit-withdraw`,
    });

    // end of update sync bank
    res.status(200).json({
      status: "success",
      transaction,
      message: syncBankResponse.message,
    });
  }
);

/**
 * @openapi
 * /api/v1/sync-bank/deposit:
 *   post:
 *     tags:
 *        - SyncBank
 *     description: Allows user to deposit to their sync bank
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: amount
 *          description: Please provide an amount to deposit
 *        - name: networkType
 *          description: Please provide which network type you are trying to access
 *        - name: timestamp
 *          description: Please provide the timestamp
 *     responses:
 *       200:
 *         description: . Returns an update transaction object.
 */
router.post(
  "/api/v1/sync-bank/withdraw",
  [
    body("amount")
      .notEmpty()
      .withMessage("please provide the amount you are willing to deposit"),
    body("networkType")
      .notEmpty()
      .withMessage(
        "please provide from which network are you withdrawing from"
      ),
    body("timestamp").notEmpty().withMessage("provide the user timestamp"),
  ],
  requireAuth,
  async (req: Request, res: Response) => {
    let { amount, networkType, timestamp } = req.body;

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
      transaction_type: ITransactionType.DEPOSIT,
      amount,
      networkType,
    });

    // automatically

    // buy the assets
    // TODO: Notification
    const msg = `You have successfully withdraw ${networkType} ${amount}`;
    await Notification.create({
      notification_type: NotificationType.BOOM,
      user: req.currentUser?.id,
      message: msg,
      timestamp: new Date(timestamp),
    });

    onSignalSendNotification({
      contents: {
        en: msg,
        es: msg,
      },
      include_external_user_id: [req.currentUser?.device_id!],
      name: `deposit-withdraw`,
    });

    // end of update sync bank
    res.status(200).json({
      status: "success",
      transaction,
      message: syncBankResponse.message,
    });
  }
);

export { router as SyncBankCurrentUserDepositRoute };
