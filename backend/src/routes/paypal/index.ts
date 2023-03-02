import { Router, Request, Response } from "express";
import { body } from "express-validator"
import { PaypalItem } from "../../types/paypal";
import { randomCode } from "../../utils/common";
import { createPayment } from "../../utils/paypal-util";
import { validateRequest, requireAuth } from "./../../middlewares"
import { Product } from "./../../models"
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

router.post("/api/paypal/checkout", [
    body("actionType").notEmpty().withMessage("please provide your action type e.g withdraw/deposit"),
    body("networkType").notEmpty().withMessage("Please provide your network type e.g BNB/TZ/MATIC"),
    body("items").notEmpty().withMessage("Please provide your items"),
],
requireAuth, 
validateRequest, async (req: Request, res: Response) => {

    const { actionType, networkType, items } = req.body;

    const line_items: PaypalItem[] = items.map(async (item: {
        id: string;
        name: string;
        quantity: number;
    }) => {
        const storeItem = await Product.findById(item.id)

        return {
            name: storeItem?.name,
            sku: `${storeItem?.name}-${randomCode()}`,
            quantity: item.quantity,
            price: (storeItem?.price_in_cents! / 100),
            currency: "USD"
        }
    });


    const total = line_items.reduce((init, next) => {
        return init + (Number(next.price) * next.quantity);
    }, 10);
    const amount = {
        currency: "USD",
        total: total.toString(),
    }

    const redirect_urls = {
        "return": "http://boom.app/paypal/success",
        "cancel": "http://boom.app/paypal/cancel",
    }

    const response = await createPayment({
        redirect_urls: { 
          return_url: redirect_urls.return, 
          cancel_url: redirect_urls.cancel 
        },
        items: line_items,
        amount
    });

    // check if the payment went through
    console.log("Paypal", response.payment);
    if (response.payment) {
        const transactionRef = await getNextTransaction();

        await Transaction.create({
            transaction_number: transactionRef,
            amount: total,
            user: req.currentUser?.id!,
            transaction_type:
                actionType === ActionType.DEPOSIT
                    ? ITransactionType.DEPOSIT
                    : ITransactionType.WITHDRAW,
            status: ITransactionStatus.PENDING,
            stripeId: response.payment,
            stripeActions: `${actionType},${networkType}`,
        });
    }
    res.status(200).json({ error: "Error occurred" });

});

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

export {router as PayPalRoutes}

