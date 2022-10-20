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
  ],
  requireAuth,
  async (req: Request, res: Response) => {
    const { amount } = req.body;

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
      transactionId: transactionRef,
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
