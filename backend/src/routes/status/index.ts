import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { Status, StatusType } from "./../../models/status";
import { validateRequest } from "../../middlewares/validate-request";
import { requireAuth } from "../../middlewares/require-auth";
import { ApiResponse } from "../../utils/api-response";

const router = Router();

/**
 * @openapi
 * /api/v1/statuses-types:
 *   get:
 *     tags:
 *        - Status(Epic & Tales)
 *     description: List of statues types  available to for the boom platform.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of statues types.
 */
router.get("/api/v1/statuses-types", async (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "success", status_types: Object.values(StatusType) });
});

/**
 * @openapi
 * /api/v1/statuses:
 *   get:
 *     tags:
 *        - Status(Epic & Tales)
 *     description: List all epics or tales.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . list all epics epic/tales
 */

router.get("/api/v1/statuses", async (req: Request, res: Response) => {
  const response = new ApiResponse(Status.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const statuesList = await Status.aggregate([
    { $match: { is_active: true } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $group: {
        _id: {
          username: "$user.username",
          id: "$user._id",
          photo: "$user.photo",
        },
        count: { $sum: 1 },
        statues: {
          $push: {
            id: "$_id",
            image_url: "$image_url",
            views: "$views",
          },
        },
      },
    },
  ]);
  // const count = await response.query;

  // const statuses = await response.paginate().query;

  res.status(200).json({
    status: "success",
    page: response?.page_info,
    // count: count.length,
    statuses: statuesList,
  });
});

/**
 * @openapi
 * /api/v1/statuses:
 *   post:
 *     tags:
 *        - Status(Epic & Tales)
 *     description: Enables  users to either upload epics or tales.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: image_url
 *          description: Please provide image for the epic
 *        - name: status_type
 *          description: Please status type
 *     responses:
 *       200:
 *         description: . Successfully created your epic/tales
 */
router.post(
  "/api/v1/statuses",
  [
    body("image_url").notEmpty().withMessage("please provide tale/epic image"),
    body("status_type").notEmpty().withMessage("please provide status type"),
  ],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    const { image_url, status_type } = req.body;
    let period = 24;

    if (status_type === StatusType.EPIC) {
      period = 12;
    }

    const expiry_time = new Date(
      new Date(Date.now()).getTime() + period * 60 * 60 * 1000
    );

    console.log("E.T", expiry_time);
    const status = new Status({
      status_type,
      image_url,
      expiry_time,
      user: req.currentUser?.id!,
    });
    await status.save();
    res.status(201).json({
      status: "success",
      message: "Successfully uploaded your ${status_type}",
      status_data: status,
    });
  }
);

/**
 * @openapi
 * /api/v1/statuses/:id:
 *   delete:
 *     tags:
 *        - Status(Epic & Tales)
 *     description: Enables  users to delete their epic or tale.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Successfully deleted your epic/tale
 */
router.delete(
  "/api/v1/statuses/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    await Status.findByIdAndDelete(req.params.id);

    res.status(201).json({
      status: "success",
      message: "Successfully deleted your status",
    });
  }
);

/**
 * @openapi
 * /api/v1/statuses/:id:
 *   patch:
 *     tags:
 *        - Status(Epic & Tales)
 *     description: Enables  users to update viewer their epic or tale.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Successfully updates viewer your epic/tale
 */
router.patch(
  "/api/v1/statuses/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const status = await Status.findByIdAndUpdate(req.params.id, {
      $push: { views: req.currentUser?.id },
    });

    res.status(201).json({
      status: "success",
      status_item: status,
      message: "Successfully updated status",
    });
  }
);
export { router as EpicTaleRoutes };
