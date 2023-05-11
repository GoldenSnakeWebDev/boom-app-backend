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
import { Boom } from "./../../models/boom";
import { getNextTransaction } from "../../utils/transaction-common";
import { BadRequestError } from "../../errors/bad-request-error";
import { NotificationType, Notification } from "./../../models/notification";
import { validateRequest } from "../../middlewares";
import { onSignalSendNotification } from "../../utils/on-signal";
const router = Router();
/**
 * @openapi
 * /api/v1/sync-bank/transfer-sync:
 *   post:
 *     tags:
 *        - SyncBank-Transfer
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
  "/api/v1/sync-bank/transfer-sync",
  [
    body("amount")
      .notEmpty()
      .withMessage("please provide the amount you are willing to transfer"),
    body("user")
      .notEmpty()
      .withMessage("please provide the user id you are trying transfer to"),
    body("networkType")
      .notEmpty()
      .withMessage("please provide  which network are you tipping from"),
    body("timestamp").notEmpty().withMessage("provide the user timestamp"),
  ],
  requireAuth,
  async (req: Request, res: Response) => {
    let { amount, user, networkType, timestamp } = req.body;
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
      message: `Successfully transferred ${amount} to ${tipedUser?.username}`,
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
      message: `You have received ${amount} from ${req.currentUser?.username}`,
      timestamp: new Date(timestamp),
    });

    res.status(200).json({
      status: "success",
      transaction,
      message: syncBankResponse.message,
    });
  }
);

/**
 * @openapi
 * /api/v1/transfer-my-boom/:id:
 *   post:
 *     tags:
 *        - Booms
 *     description: Enable transfer of single boom to another user.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: receiver
 *          description: Provider the new owner id `receiver`
 *     responses:
 *       200:
 *         description: . Enable transfer of single boom to another user
 */

router.post(
  "/api/v1/transfer-my-boom/:id",
  [
    body("receiver")
      .notEmpty()
      .withMessage("Provider the receiver information"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { receiver } = req.body;
    const existBoom = await Boom.findById(req.params.id);

    if (!existBoom) {
      throw new BadRequestError("This boom does not exist");
    }

    const oldOwner = await User.findById(existBoom.user);

    if (!oldOwner) {
      throw new BadRequestError("The boom owner does not exist");
    }

    // end of deducting  wallet amount

    const newOwner = await User.findById(receiver);
    if (!newOwner) {
      throw new BadRequestError(
        "The user you trying to transfer to does not exists"
      );
    }

    // update the boom to a new user
    await Boom.findByIdAndUpdate(
      existBoom.id,
      { user: receiver },
      { new: true }
    );

    // OLD OWNER's Notification
    await Notification.create({
      message: `${req.currentUser?.username}, you have successfully transferred your boom to ${newOwner.username}`,
      user: oldOwner.id,
      boom: existBoom.id,
      notification_type: NotificationType.BOOM,
    });

    await onSignalSendNotification({
      contents: {
        en: `${req.currentUser?.username}, you have successfully transferred your boom to ${newOwner.username}`,
        es: `${req.currentUser?.username}, you have successfully transferred your boom to ${newOwner.username}`,
      },
      include_external_user_id: [oldOwner.device_id!],
      name: "Boom Sent",
    });

    // New Owner's Notification
    await Notification.create({
      message: `You have received a new boom from  ${req.currentUser?.username}`,
      user: newOwner?.id,
      boom: existBoom.id,
      notification_type: NotificationType.BOOM,
    });

    await onSignalSendNotification({
      contents: {
        en: `You have received a new boom from  ${req.currentUser?.username}`,
        es: `You have received a new boom from  ${req.currentUser?.username}`,
      },
      include_external_user_id: [newOwner?.device_id!],
      name: "Boom Received",

    });

    res.status(200).json({
      status: "success",
      message: "Successfully transferred your boom to a new owner",
    });
  }
);

export { router as TransferSyncRoute };
