import { Router, Response, Request } from "express";
import { ApiResponse } from "./../../utils/api-response";
import { Network, NetworkType } from "./../../models/network";
import { BadRequestError } from "../../errors/bad-request-error";
import { currencyConversion } from "../../utils/price-convetor";

const router = Router();

/**
 * @openapi
 * /api/v1/booms-types:
 *   get:
 *     tags:
 *        - Networks
 *     description: List the type of blockchain networks.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of network types.
 */
router.get("/api/v1/network-types", async (_req: Request, res: Response) => {
  // const full_url = req.protocol + "://" + req.get("host");
  // console.log(full_url, LOGOS/TezosLogo_Icon_Blue.png);
  res
    .status(200)
    .json({ status: "success", network_types: Object.values(NetworkType) });
});

/**
 * @openapi
 * /api/v1/networks:
 *   get:
 *     tags:
 *        - Networks
 *     description: List of networks available to for the boom platform.
 *     produces:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of blockchain networks.
 */
router.get("/api/v1/networks", async (req: Request, res: Response) => {
  const response = new ApiResponse(Network.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const networks = await response.paginate().query;
  const full_url = req.protocol + "://" + req.get("host");
  const base_url =
    full_url.includes("127.0.0.1") || full_url.includes("localhost")
      ? `http://127.0.0.1:4000`
      : full_url;
  const new_networks = networks.map((item: any) => {
    if (item.symbol === "TZ") {
      return {
        name: item.name,
        image_url: `${base_url}/backend/LOGOS/TezosLogo_Icon_Blue.png`,
        symbol: item.symbol,
        is_active: item.is_active,
        id: item._id,
      };
    }

    if (item.symbol === "BNB") {
      return {
        name: item.name,
        image_url: `${base_url}/backend/LOGOS/binance-icono.png`,
        symbol: item.symbol,
        is_active: item.is_active,
        id: item._id,
      };
    }

    if (item.symbol === "MATIC") {
      return {
        name: item.name,
        image_url: `${base_url}/backend/LOGOS/polygon-matic-logo.png`,
        symbol: item.symbol,
        is_active: item.is_active,
        id: item._id,
      };
    }

    if (item.symbol === "OKT") {
      return {
        name: item.name,
        image_url: `${base_url}/backend/LOGOS/okx.png`,
        symbol: item.symbol,
        is_active: item.is_active,
        id: item._id,
      };
    }

    return {
      name: item.name,
      image_url: item.image_url,
      symbol: item.symbol,
      is_active: item.is_active,
      id: item._id,
    };
  });

  res.status(200).json({
    status: "success",
    page: response?.page_info,
    networks: new_networks,
  });
});

/**
 * @openapi
 * /api/v1/networks-pricing?symbol=TZ&amount=1:
 *   get:
 *     tags:
 *        - Networks
 *     description: Get network pricining
 *     produces:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a network with its price.
 */
router.get("/api/v1/networks-pricing", async (req: Request, res: Response) => {
  const symbol = req.query?.symbol?.toString();
  const amount = req.query?.amount?.toString();

  const network = await Network.findOne({ symbol: symbol?.toUpperCase() });

  if (!network) {
    throw new BadRequestError(
      "Please provide the network symbol as ?symbol=BNB&amount=1"
    );
  }
  let networkType: any;

  if (symbol! === NetworkType.POLYGON) {
    networkType = NetworkType.POLYGON;
  } else if (symbol! === NetworkType.TEZOS) {
    networkType = NetworkType.TEZOS;
  } else if (symbol! === NetworkType.BINANCE) {
    networkType = NetworkType.BINANCE;
  } else if (symbol! === NetworkType.OK_COIN) {
    networkType = NetworkType.OK_COIN;
  }

  const currentPrice = await currencyConversion(
    networkType,
    parseFloat(amount!)
  );

  res.status(200).json({
    status: "success",
    currentUSDPrice: currentPrice.amount,
  });
});

export { router as NetworksListRoutes };
