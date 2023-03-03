import Stripe from "stripe";
import { config } from "./../config";

export const stripe = new Stripe(config.STRIPE.SK, {
  apiVersion: "2022-11-15",
});

export const stripeCheckOut = async (
  items: Array<{
    price_data: {
      currency: "usd";
      product_data: {
        name: string;
      };
      unit_amount: number;
    };
    quantity: number;
  }>,
  success_url: string,
  cancel_url: string
) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items,
      success_url,
      cancel_url,
    });

    return {
      url: session.url,
      error: "",
      amount_total: session.amount_total,
      id: session.id,
      createdAt: new Date(session.created),
    };
  } catch (error: any) {
    return {
      url: "",
      error: error.message,
      amount_total: 0,
      id: "",
      createdAt: "",
    };
  }
};

export const stripeProcessCallBack = (body: any) => {
  console.log(body);
};

/**
 * Create a payout
 * @param opts 
 * @returns 
 */
export const stripeCreatePayout = async (opts: {
  amount: number;
  currency: string;
}) => {
  try {
    const session = await stripe.payouts.create({
      amount: opts.amount,
      method: "instant",
      currency: "USD",
      source_type: "card",
      description: "Successfully you have recieved a payment",
    });
    return {
      error: "",
      amount_total: session.amount,
      createdAt: new Date(session.arrival_date),
    };
  } catch (error: any) {
    return {
      error: error.message,
      amount_total: 0,
      createdAt: new Date(Date.now())
    };
  }
};
