import { Router, Response, Request } from "express";
import { ApiResponse } from "./../../utils/api-response";
import { Boom, BoomType } from "./../../models/boom";
import { requireAuth } from "../../middlewares/require-auth";

const router = Router();

/**
 * @openapi
 * /api/v1/booms-types:
 *   get:
 *     tags:
 *        - Booms
 *     description: List of all boom types  available to for the boom platform.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of boom types.
 */
router.get("/api/v1/booms-types", async (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "success", boom_types: Object.values(BoomType) });
});

/**
 * @openapi
 * /api/v1/booms:
 *   get:
 *     tags:
 *        - Booms
 *     description: List of all platform booms.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of booms.
 */
router.get("/api/v1/booms", async (req: Request, res: Response) => {
  const response = new ApiResponse(Boom.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  // const count = await response.query;

  const booms = await response.paginate().query;

  res.status(200).json({
    status: "success",
    page: response?.page_info,
    // count: count.length,
    booms,
  });
});

/**
 * @openapi
 * /api/v1/booms/mine:
 *   get:
 *     tags:
 *        - Booms
 *     description: List of all  user  platform booms.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of booms.
 */
router.get(
  "/api/v1/booms/mine",
  requireAuth,
  async (req: Request, res: Response) => {
    const response = new ApiResponse(
      Boom.find({ user: req.currentUser?.id }),
      req.query
    )
      .filter()
      .sort()
      .limitFields();

    // const count = await response.query;

    const booms = await response.paginate().query;

    res.status(200).json({
      status: "success",
      page: response?.page_info,
      // count: count.length,
      booms,
    });
  }
);

/**
 * @openapi
 * /api/v1/booms/:id:
 *   get:
 *     tags:
 *        - Booms
 *     description: Get details of a single boom.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns an object of a single boom.
 */
router.get("/api/v1/booms/:id", async (req: Request, res: Response) => {
  const boom = await Boom.findById(req.params.id);
  res.status(200).json({ status: "success", boom });
});

export { router as BoomListRoutes };
