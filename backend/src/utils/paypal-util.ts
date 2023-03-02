import paypal from  "paypal-rest-sdk"
import {config}  from "./../config"
import  {PaypalItem}  from "./../types/paypal"
paypal.configure({
    mode: config.PAYPAL.PAYPAL_CLIENT_ENV,
    client_id: config.PAYPAL.PAYPAL_CLIENT_ID,
    client_secret: config.PAYPAL.PAYPAL_CLIENT_SECRET,
});


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
}) =>{
  // prepare create payment json
  const paymentJson = {
     "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    redirect_urls:  opts.redirect_urls,
    "transactions": [{
        "item_list": {
            items: opts.items
        },
        amount: opts.amount,
        "description": `Making a deposit of ${opts.amount.currency} ${opts.amount.total}`    
    }]
  }
  //create actual paypal payment
   paypal.payment.create(paymentJson, (error: any, payment: any) => {
      if(error) {
        return  {error: `An error occurred while processing your paypal payment`, payment: null};
      }
      return  {
      error:  null,
      payment,
    }
    });
    return  {error: `An error occurred while processing your paypal payment`, payment: null};
 }
