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
import { requireAuth } from "../../middlewares/require-auth";
import { onSignalSendNotification } from "../../utils/on-signal";
import { validateRequest } from "../../middlewares/validate-request";
import { NetworkType } from "../../models/network";
import { v2PancakeSwap } from "../../swapping/swap";
import { config } from "../../config";

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
 *     parameters:
 *        - name: amount
 *          description: The amount of the coin deposited/withdrawn
 *        - name:  networkType
 *          description: The network type e.g TZ/MATIC/BNB
 *        - name: actionType
 *          description: What action to use e.g deposit/withdraw
 *        - name: timestamp
 *          description: Your current timestamp send from the send's phone  (app)
 *        - name:  boombox_type
 *          description: The boom type is optional default is public, other is privave
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
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    let { amount, networkType, timestamp, actionType } = req.body;

    if (timestamp) {
      timestamp = Date.now();
    }

    const transactionRef = await getNextTransaction();

    await Transaction.create({
      transaction_number: transactionRef,
      amount,
      user: req.currentUser?.id!,
      transaction_type: ITransactionType.DEPOSIT,
      status: ITransactionStatus.SUCCESS,
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
      timestamp: timestamp,
    });
    // buy assets
    if (actionType === "deposit") {
      if (networkType === NetworkType.BINANCE) {
        v2PancakeSwap.swap(amount, config.EXCHANGE.PANCAKE_ADDRESS.BNB);
      } else if (networkType === NetworkType.TEZOS) {
        v2PancakeSwap.swap(amount, config.EXCHANGE.PANCAKE_ADDRESS.TEZOS);
      } else if (networkType === NetworkType.POLYGON) {
        v2PancakeSwap.swap(amount, config.EXCHANGE.PANCAKE_ADDRESS.MATIC);
      }
    }

    onSignalSendNotification({
      contents: {
        en: `Successfully ${actionType} ${networkType} ${amount}`,
        es: `Successfully ${actionType} ${networkType} ${amount}`,
      },
      include_external_user_id: [req.currentUser?.device_id!],
      name: `GooglePay ${networkType} ${actionType}`,
    });
    res.status(200).json({
      status: "success",
      message: syncBankResponse.message,
    });
  }
);

export { router as CallbackURLRoute };
