import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { BadRequestError } from "../../errors";
import { requireAuth, validateRequest } from "../../middlewares";
import { BoomBox } from "../../models/box";
import { ApiResponse } from "../../utils/api-response";

const router = Router();

router.get("/api/v1/boom-box", async (req: Request, res: Response) => {
  const response = new ApiResponse(
    BoomBox.find({ is_deleted: false })
      .populate("user", "username photo first_name last_name")
      .populate("members.user", "username photo first_name last_name"),
    req.query
  )
    .filter()
    .sort()
    .limitFields();
  const boomBoxes = await response.query;

  res.status(200).json({
    status: "success",
    boomBoxes,
  });
});

router.post(
  "/api/v1/boom-box",
  [
    body("label").notEmpty().withMessage("please provide the boom box label"),
    body("members")
      .notEmpty()
      .withMessage("Provide an list of your fans or frens"),

    body("timestamp").notEmpty().withMessage("Provide your timestamp"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { members, label, image_url, timestamp } = req.body;

    if (typeof members !== "object") {
      throw new BadRequestError("The list of frens or fans is incorrect");
    }
    const boomBox = await BoomBox.create({
      label,
      image_url,
      user: req.currentUser?.id!,
      members: [
        {
          is_admin: true,
          user: req.currentUser?.id!,
          created_at: new Date(timestamp),
        },
      ],
      created_at: new Date(timestamp),
    });

    res.status(200).json({
      status: "success",
      message: `Successfully created ${boomBox.label}`,
    });
  }
);

router.patch(
  "/api/v1/boom-box/:id",
  [
    body("label").notEmpty().withMessage("please provide the boom box label"),
    body("members")
      .notEmpty()
      .withMessage("Provide an list of your fans or frens"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { members, label, image_url, timestamp } = req.body;

    if (typeof members !== "object") {
      throw new BadRequestError("The list of frens or fans is incorrect");
    }

    // the object of members :should be in the format
    // ["id", "id", "id"]
    let boomBox = await BoomBox.findById(req.params.id);

    if (!boomBox) {
      throw new BadRequestError("The boombox not found");
    }

    const newMembers: any = members.map((item: any) => {
      return {
        user: item,
        created_at: new Date(timestamp),
      };
    });

    boomBox = await BoomBox.findByIdAndUpdate(boomBox.id, {
      label: label,
      image_url: image_url,
      members: { $push: { members: { $each: newMembers } } },
    });

    res.status(200).json({
      status: "success",
      message: `Successfully updated ${boomBox?.label}`,
    });
  }
);

router.delete(
  "/api/v2/boombox/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const boomBox = await BoomBox.findById(req.params.id);

    if (!boomBox) {
      throw new BadRequestError("The boombox was not found");
    }

    await BoomBox.findByIdAndUpdate(boomBox.id, { is_deleted: true });

    res.status(204).json({});
  }
);

export { router as BoomBoxRoutes };
