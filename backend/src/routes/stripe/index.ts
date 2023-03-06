import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "./../../middlewares";
import { stripeCheckOut, StripeItem } from "../../utils/stripe-payment";
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

/**
 * @openapi
 * /api/v1/stripe/products:
 *   post:
 *     tags:
 *        - Stripe
 *     description: Enables users to buy sync bank coins
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: name
 *          description: Please provide the product name
 *     responses:
 *       200:
 *         description: Successfully created a product
 */
router.post(
  "/api/v1/stripe/products",
  [
    body("name").notEmpty().withMessage("Provide your the product name"),
    body("price_in_cents")
      .notEmpty()
      .withMessage("Provide your the product price in cents"),
    body("description")
      .notEmpty()
      .withMessage("Provide your the product description"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { name, description, price_in_cents } = req.body;

    const product = await Product.create({ name, description, price_in_cents });

    res.status(201).json({
      product,
      message: "Sucessfully created a product",
    });
  }
);

router.patch(
  "/api/v1/stripe/products/:id",
  [
    body("name").notEmpty().withMessage("Provide your the product name"),
    body("price_in_cents")
      .notEmpty()
      .withMessage("Provide your the product price in cents"),
    body("description")
      .notEmpty()
      .withMessage("Provide your the product description"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { name, description, price_in_cents } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price_in_cents },
      { new: true }
    );

    res.status(201).json({
      product,
      message: "Sucessfully updated a product",
    });
  }
);

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
    const { actionType, networkType, items } = req.body;
    const products = await Product.find({
      _id: { $in: items.map((it: any) => it.id) },
    });


    const line_items : StripeItem[] = products?.map((storeItem) => {
      const item = items.find((i: any) => i.id === storeItem.id);
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
    });


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

      return res.status(200).json({ url: session.url });
    }

    return res.status(200).json({ url: session.url });
  }
);

router.post(
  "/api/v1/stripe-checkout-callback-url",
  async (req: Request, res: Response) => {
    console.log(req.body);

    const data: any = req.body?.data.object;

    const id = data.id;

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
        message: `You have successfully ${actionType} ${networkType} ${amount}`,
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
          en: `You have successfully ${actionType} ${networkType} ${amount}`,
          es: `You have successfully ${actionType} ${networkType} ${amount}`,
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
