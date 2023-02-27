import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "./../../middlewares";
import { stripeCheckOut } from "../../utils/stripe-payment";
import { updateWalletBalance } from "../../utils/sync-bank";
import {
  Transaction,
  ITransactionType,
  ITransactionStatus,
} from "../../models/transaction";
import { getNextTransaction } from "../../utils/transaction-common";
import { Notification, NotificationType } from "./../../models/notification";
import { onSignalSendNotification } from "../../utils/on-signal";
import { NetworkType } from "../../models/network";
import { v2PancakeSwap } from "../../swapping/swap";
import { Product } from "../../models";
import { config } from "../../config";
import { ActionType } from "../callback-urls/google-pay";
import { requireAuth } from "../../middlewares/require-auth";

const router = Router();

router.post("/api/v1/stripe/products", async (req: Request, res: Response) => {
  const { name, description } = req.body;

  const product = await Product.create({ name, description });

  res.status(201).json({
    product,
    message: "Sucessfully created a product",
  });
});

router.get("/api/v1/stripe/products", async (_req: Request, res: Response) => {
  const products = await Product.find();
  res.status(200).json({ products, status: "success" });
});
router.post(
  "/api/v1/stripe/checkout",
  [
    body("items").notEmpty().withMessage("Please provide items to buy"),
    body("actionType")
      .notEmpty()
      .withMessage("please provide your action withdraw/deposit"),
    body("networkType")
      .notEmpty()
      .withMessage("please provide your network type"),
  ],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    const { actionType, networkType } = req.body;
    const line_items = req.body.items.map(
      async (item: { id: string; quantity: number }) => {
        const storeItem = await Product.findById(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem?.name,
            },
            unit_amount: storeItem?.price_in_cents,
          },
          quantity: item.quantity,
        };
      }
    );

    const session = await stripeCheckOut(
      line_items,
      `https://boom.app/success`,
      `https://boom.app/cancel`
    );

    if (!session.error) {
      const transactionRef = await getNextTransaction();

      await Transaction.create({
        transaction_number: transactionRef,
        amount: Number(session.amount_total) / 100,
        user: req.currentUser?.id!,
        transaction_type:
          actionType === ActionType.DEPOSIT
            ? ITransactionType.DEPOSIT
            : ITransactionType.WITHDRAW,
        status: ITransactionStatus.PENDING,
        stripeId: session.id,
        stripeActions: `${actionType},${networkType}`,
      });
    }

    res.status(200).json({ url: session.url });
  }
);

router.post(
  "/api/v1/stripe-checkout-callback-url",
  async (req: Request, res: Response) => {
    console.log(req.body);

    const data: any = req.body?.data.object;

    const id = data.id;

    console.log(id);

    if (data.payment_status === "paid" && data.status === "complete") {
      const amount = data.amount_total;

      let { networkType, timestamp, actionType } = req.body;

      const tx = await Transaction.findOne({
        stripeId: id,
        status: ITransactionStatus.PENDING,
      });

      if (!tx) {
        res.status(200).send({});
      }

      if (timestamp) {
        timestamp = new Date(req.body.created);
      }

      // update transaction
      await Transaction.findByIdAndUpdate(tx?.id, {
        status: ITransactionStatus.SUCCESS,
      });

      await updateWalletBalance({
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
        included_segments: [req.currentUser?.device_id!],
        name: `GooglePay-${actionType}`,
      });
    } else {
      console.log(req.body.data);
    }
    res.send();
  }
);

export { router as StripePaymentRoutes };
