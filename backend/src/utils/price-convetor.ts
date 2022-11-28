import axios from "axios";
import { load } from "cheerio";
export enum NetworkType {
  POLYGON = "polygon",
  BINANCE = "binance",
  TEZOS = "tezos",
}

export const currencyConversion = async (
  network: NetworkType,
  amount: number
) => {
  let url = "";

  if (network === NetworkType.POLYGON) {
    url = `https://www.coingecko.com/en/coins/polygon`;
  } else if (network === NetworkType.TEZOS) {
    url = `https://www.coingecko.com/en/coins/tezos`;
  } else if (network === NetworkType.BINANCE) {
    url = `https://www.coingecko.com/en/coins/bnb`;
  }

  console.log(url);

  try {
    const { data } = await axios.get(url);
    let $ = load(data);
    console.log($.html());
    const htmlData = $("#unobtrusive-flash-messages").html();

    console.log(htmlData);
    const numberPattern = /\d+/g;

    console.log(numberPattern, amount);
    return { amount: 0, error: "" };
  } catch (error) {
    return {
      amount: 0,
      error: `Error ${error}`,
    };
  }
};
