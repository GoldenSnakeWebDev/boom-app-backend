import { Router, Response, Request } from "express";
import { ApiResponse } from "./../../utils/api-response";
import { Network } from "./../../models/network";

const router = Router();

/**
 * @openapi
 * /api/v1/networks:
 *   get:
 *     tags:
 *        - Booms
 *     description: List of networks available to for the boom platform.
 *     produces:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of blockchain networks.
 */
router.get("/api/v1/networks", async (req: Request, res: Response) => {
  const response = new ApiResponse(Network.find({ is_active: true }), req.query)
    .filter()
    .sort()
    .limitFields();

  const count = await response.query;

  const booms = await response.paginate().query();

  res.status(200).json({
    status: "success",
    page: response?.page_info,
    count: count.length,
    booms,
  });
});

export { router as BoomListRoutes };
