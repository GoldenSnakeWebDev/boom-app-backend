import axios from "axios";
import * as cheerio from "cheerio";
import { NetworkType } from "../models";

export const priceOKXScrap = async () => {
  const url = "https://coinmarketcap.com/currencies/okt/";

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const priceSection = $(".priceSection");
    const priceValue = priceSection.find(".priceValue").text();
    return Number(priceValue.replace("$", ""));
  } catch (error) {
    console.log("Error", error);
    return 0;
  }
};

export const currencyConversion = async (
  network: NetworkType,
  amount: number
) => {
  let url: string;

  if (network === NetworkType.OK_COIN) {
    const amount = await priceOKXScrap();
    return {
      amount,
      error: "",
    };
  }

  if (network === NetworkType.POLYGON) {
    url = `https://www.binance.com/api/v3/depth?symbol=MATICUSDT`;
  } else if (network === NetworkType.TEZOS) {
    url = `https://www.binance.com/api/v3/depth?symbol=XTZUSDT`;
  } else if (network === NetworkType.BINANCE) {
    url = `https://www.binance.com/api/v3/depth?symbol=BNBUSDT`;
  } else {
    url = `https://www.binance.com/api/v3/depth?symbol=${network}USDT`;
  }

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
