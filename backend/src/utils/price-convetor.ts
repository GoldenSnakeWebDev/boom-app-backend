import axios from "axios";
import { NetworkType } from "./../models/network";

export const currencyConversion = async (
  network: NetworkType,
  amount: number
) => {
  let url = "";

  console.log(network);

  if (network === NetworkType.POLYGON) {
    url = `https://www.binance.com/api/v3/depth?symbol=MATICUSDT`;
  } else if (network === NetworkType.TEZOS) {
    url = `https://www.binance.com/api/v3/depth?symbol=XTZUSDT`;
  } else if (network === NetworkType.BINANCE) {
    url = `https://www.binance.com/api/v3/depth?symbol=BNBUSDT`;
  }

  console.log("URL:", url);
  try {
    const { data } = await axios.get(url);

    return { amount: parseFloat(data.bids[0][0]) * amount, error: "" };
  } catch (error) {
    return {
      amount: 0,
      error: `Error ${error}`,
    };
  }
};
