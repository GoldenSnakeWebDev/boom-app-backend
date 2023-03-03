import paypal from "paypal-rest-sdk"
import { config } from "./../config"
import { PaypalItem, PayOutType } from "./../types/paypal"

// Configure paypal
paypal.configure({
  mode: config.PAYPAL.PAYPAL_CLIENT_ENV,
  client_id: config.PAYPAL.PAYPAL_CLIENT_ID,
  client_secret: config.PAYPAL.PAYPAL_CLIENT_SECRET,
});


/**
 * Create Paypal payment
 * @param opts 
 * @returns 
 */
export const createPayment = async (opts: {
  redirect_urls: {
    return_url: string;
    cancel_url: string;
  },
  items: PaypalItem[],
  amount: {
    currency: string;
    total: string;
  }
}) => {
  // prepare create payment json
  const paymentJson = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    redirect_urls: opts.redirect_urls,
    "transactions": [{
      "item_list": {
        items: opts.items
      },
      amount: opts.amount,
      "description": `Making a deposit of ${opts.amount.currency} ${opts.amount.total}`
    }]
  }

  //create actual paypal payment
  return new Promise((resolve, reject) => {
    paypal.payment.create(paymentJson, (error: any, payment: any) => {
      if (error) {
        // console.log(JSON.stringify(error.response));
        reject({ error: `An error occurred while processing your paypal payment`, payment: null, url: null })
      }
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          // console.log(payment.links[i].href);
          resolve({ url: payment.links[i].href, error: null, payment: payment.id })
        }
      }
      reject({ url: null, error: null, payment: null })
    });
  })
}



/**
 * Create Payouts
 */


export const createPayout = async (opts: {
  sender_batch_header: {
    sender_batch_id: string;
    email_subject: string;
  };
  items: PayOutType[]
}) => {
  // var sender_batch_id = Math.random().toString(36).substring(9);

  let create_payout_json = {
    "sender_batch_header": opts.sender_batch_header,
    "items": opts.items
  };
  const sync_mode = true;
  return new Promise((resolve, reject) => {
    paypal.payout.create(create_payout_json, sync_mode, (error: any, payment: any) => {
      if (error) {
        console.log(JSON.stringify(error.response));
        reject({ error: `An error occurred while processing your paypal payouts`, payment: null, url: null })
      }else {
        console.log("Create Single Payout Response");
        resolve({ url: "url", error: null, payment: payment.id })
      }
    });
  });
}