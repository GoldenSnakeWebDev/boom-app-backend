import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { BadRequestError } from "../../errors";
import { requireAuth, validateRequest } from "../../middlewares";
import { BoomBox, BoomBoxType } from "../../models/box";
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
    let boomBox = await BoomBox.create({
      label,
      image_url,
      user: req.currentUser?.id!,
      box_type: BoomBoxType.PUBLIC,
      members: [
        {
          is_burnt: false,
          is_admin: true,
          user: req.currentUser?.id!,
          created_at: new Date(timestamp),
        },
      ],
      created_at: new Date(timestamp),
    });

    const newMembers: Array<{
      user: string;
      created_at: Date;
      is_burnt: boolean;
      is_admin: boolean;
    }> = members.map((item: any) => {
      return {
        user: item,
        is_burnt: false,
        is_admin: false,
        created_at: new Date(timestamp),
      };
    });

    await BoomBox.findByIdAndUpdate(
      boomBox.id,
      {
        $addToSet: { members: { $each: newMembers } },
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      boomBox,
      message: `Successfully created ${boomBox.label}`,
    });
  }
);

router.get(
  "/api/v1/boom-box/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const boomBox = await BoomBox.findById(req.params.id)
      .populate("user", "username photo first_name last_name")
      .populate("members.user", "username photo first_name last_name");
    res.status(200).json({ status: "success", boomBox });
  }
);

router.patch(
  "/api/v1/boom-box/:id",
  [
    body("label").notEmpty().withMessage("please provide the boom box label"),
    body("timestamp").notEmpty().withMessage("Provide your timestamp"),
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
    let boomBox = await BoomBox.findById(req.params.id)
      .populate("user", "username photo first_name last_name")
      .populate("members.user", "username photo first_name last_name");

    if (!boomBox) {
      throw new BadRequestError("The boombox not found");
    }

    const newMembers: Array<{
      user: string;
      created_at: Date;
      is_burnt: boolean;
      is_admin: boolean;
    }> = members.map((item: any) => {
      return {
        user: item.toString(),
        is_burnt: false,
        is_admin: false,
        created_at: new Date(timestamp),
      };
    });
    boomBox = await BoomBox.findByIdAndUpdate(
      boomBox.id,
      { image_url, label, $addToSet: { members: { $each: newMembers } } },
      { new: true }
    );

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

    const boomQuery = await BoomBox.findOne(
      { _id: req.params.id, "members.users": req.currentUser?.id },
      { "members.$": 1 }
    )
      .populate("user", "username photo first_name last_name")
      .populate("members.user", "username photo first_name last_name");

    const requestCaller: any = boomQuery?.user;

    if (!requestCaller.is_admin) {
      throw new BadRequestError("You are not allowed to perform this task");
    }

    await BoomBox.findByIdAndUpdate(
      boomBox.id,
      { is_deleted: true },
      { new: true }
    );

    res.status(204).json({});
  }
);

export { router as BoomBoxRoutes };
