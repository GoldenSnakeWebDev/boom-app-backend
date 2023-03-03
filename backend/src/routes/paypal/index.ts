import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { PaypalItem, PayOutType } from "../../types/paypal";
import { randomCode } from "../../utils/common";
import { createPayment, createPayout } from "../../utils/paypal-util";
import { validateRequest, requireAuth } from "./../../middlewares";
import { Product } from "./../../models";
import {
  Transaction,
  ITransactionType,
  ITransactionStatus,
} from "../../models/transaction";
import { v2PancakeSwap } from "../../swapping/swap";

import { getNextTransaction } from "../../utils/transaction-common";
import { Notification, NotificationType } from "./../../models/notification";
import { onSignalSendNotification } from "../../utils/on-signal";
import { NetworkType } from "../../models/network";
import { updateWalletBalance } from "../../utils/sync-bank";
import { ActionType } from "../callback-urls/google-pay";
import { config } from "../../config";

// create router
const router = Router();

/**
 * @openapi
 * /api/v1/paypal/checkout:
 *   post:
 *     tags:
 *        - Paypal
 *     description: Enables users to buy sync bank coins using paypal
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: actionType
 *          description: Please provide the actionType
 *        - name: networkType
 *          description: Please provide the network type
 *        - name: items
 *          description: The list of the products {id: string; quantity: number}
 *     responses:
 *       200:
 *         description: Successfully created a product
 */
router.post(
  "/api/v1/paypal/checkout",
  [
    body("actionType")
      .notEmpty()
      .withMessage("please provide your action type e.g withdraw/deposit"),
    body("networkType")
      .notEmpty()
      .withMessage("Please provide your network type e.g BNB/TZ/MATIC"),
    body("items").notEmpty().withMessage("Please provide your items"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { actionType, networkType, items } = req.body;
    const products = await Product.find({
      _id: { $in: items.map((it: any) => it.id) },
    });

    if (actionType === ActionType.DEPOSIT) {
      const line_items: PaypalItem[] = products.map((storeItem) => {
        const item = items.find((i: any) => i.id === storeItem.id);
        return {
          name: storeItem?.name,
          sku: `${storeItem?.name}-${randomCode()}`,
          quantity: item.quantity,
          price: (storeItem?.price_in_cents! / 100).toFixed(2).toString(),
          currency: "USD",
        };
      });

      const total = line_items.reduce((init, next) => {
        return init + Number(next.price) * next.quantity;
      }, 0);
      const amount = {
        currency: "USD",
        total: total.toFixed(2).toString(),
      };

      const redirect_urls = {
        return: "http://boom.app/paypal/success",
        cancel: "http://boom.app/paypal/cancel",
      };

      const response: any = await createPayment({
        redirect_urls: {
          return_url: redirect_urls.return,
          cancel_url: redirect_urls.cancel,
        },
        items: line_items,
        amount,
      });

      // check if the payment went through
      if (response.payment) {
        const transactionRef = await getNextTransaction();

        await Transaction.create({
          transaction_number: transactionRef,
          amount: total,
          user: req.currentUser?.id!,
          transaction_type:ActionType.DEPOSIT,
          status: ITransactionStatus.PENDING,
          stripeId: response.payment,
          stripeActions: `${actionType},${networkType}`,
        });

        return res.status(200).json({ url: response?.url });
      }
    } else if (actionType === ActionType.WITHDRAW) {
      // For withdrawal
      const line_items: PayOutType[] = products.map((storeItem) => {
        return {
          recipient_type: "EMAIL",
          amount: {
            value: (storeItem?.price_in_cents! / 100).toFixed(2).toString(),
            currency: "USD",
          },
          receiver: req.currentUser?.email!,
          note: "Thank you",
          sender_item_id: `${randomCode()}`,
        };
      });

      const total = products.reduce((init, next) => {
        return init + Number(next.price_in_cents) * 1;
      }, 0);

      //  create the payment
      const payout:  any = await createPayout({
        sender_batch_header: {
          sender_batch_id: "",
          email_subject: "You have a payment",
        },
        items: line_items,
      });
      /**
       * Check it a payment has happened
       */
      if (payout.payment) {
        const transactionRef = await getNextTransaction();

        await Transaction.create({
          transaction_number: transactionRef,
          amount: total,
          user: req.currentUser?.id!,
          transaction_type:ActionType.WITHDRAW,
          status: ITransactionStatus.PENDING,
          stripeId: payout.payment,
          stripeActions: `${actionType},${networkType}`,
        });

        return res.status(200).json({ url: payout?.url });
      }

    }
    return res.status(200).json({ error: "Error occurred" });
  }
);

/**
 * 
 */
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

      // update the user's wallet 
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

      // send on signal
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

export { router as PayPalRoutes };
