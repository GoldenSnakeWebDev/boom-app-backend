import { Router, Response, Request } from "express";
import { ApiResponse } from "./../../utils/api-response";
import { Network, NetworkType } from "./../../models/network";

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

  res.status(200).json({
    status: "success",
    page: response?.page_info,
    networks,
  });
});

export { router as NetworksListRoutes };
