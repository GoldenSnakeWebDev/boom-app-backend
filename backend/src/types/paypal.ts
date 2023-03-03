export interface PaypalItem {
  name: string;
  sku: string;
  quantity: number;
  price: string;
  currency: string;
}


export interface PayOutType {
  recipient_type: string;
  amount: {
    value: string;
    currency: string
  };
  receiver: string;
  note: string;
  sender_item_id: string;
}