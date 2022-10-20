import { Router, Response, Request } from "express";
import { ApiResponse } from "./../../utils/api-response";
import { Boom, BoomType } from "./../../models/boom";
import { requireAuth } from "../../middlewares/require-auth";

const router = Router();

router.get("/api/v1/booms-types", async (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "success", boom_types: Object.values(BoomType) });
});

router.get("/api/v1/booms", async (req: Request, res: Response) => {
  const response = new ApiResponse(Boom.find(), req.query)
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

    const count = await response.query;

    const booms = await response.paginate().query();

    res.status(200).json({
      status: "success",
      page: response?.page_info,
      count: count.length,
      booms,
    });
  }
);
router.get("/api/v1/booms/:id", async (req: Request, res: Response) => {
  const boom = await Boom.findById(req.params.id);
  res.status(200).json({ status: "success", boom });
});

export { router as BoomListRoutes };
