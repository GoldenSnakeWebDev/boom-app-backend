import { Router, Response, Request } from "express";
import { ApiResponse } from "./../../utils/api-response";
import { BoomBox, BoomBoxType } from "./../../models/boom-box";
import { requireAuth } from "../../middlewares/require-auth";

const router = Router();

/**
 * @openapi
 * /api/v1/boom-box-types:
 *   get:
 *     tags:
 *        - BoomBox
 *     description: List of all boom Box Type
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of boom types.
 */
router.get("/api/v1/boom-box-types", async (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "success", boom_box_types: Object.values(BoomBoxType) });
});

/**
 * @openapi
 * /api/v1/boom-boxes:
 *   get:
 *     tags:
 *        - BoomBox
 *     description: List my DMS.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of booms.
 */
router.get(
  "/api/v1/boom-boxes",
  requireAuth,
  async (req: Request, res: Response) => {
    const response = new ApiResponse(
      BoomBox.find({
        $or: [
          { "messages.author": req.currentUser?.id },
          { "messages.receiver": req.currentUser?.id },
        ],
        box_type: "public",
      })
        .populate("messages.author", "username photo first_name last_name")
        .populate("messages.receiver", "username photo first_name last_name"),
      req.query
    )
      .filter()
      .sort()
      .limitFields();

    // const count = await response.query;

    const boom_boxes = await response.query;

    res.status(200).json({
      status: "success",
      page: response?.page_info,
      boom_boxes,
    });
  }
);

export { router as BoomBoxRoutes };
