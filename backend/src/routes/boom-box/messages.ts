import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { BadRequestError } from "../../errors";
import { requireAuth, validateRequest } from "../../middlewares";
import { User } from "../../models";
import { BoomBox, BoomBoxType } from "../../models/box";
import { Message } from "../../models/message";
import { ApiResponse } from "../../utils/api-response";

const router = Router();

router.post(
  "/api/v1/boom-box-messages/start-converstion",
  [
    body("members")
      .notEmpty()
      .withMessage("Provide an list of your fans or frens"),

    body("timestamp").notEmpty().withMessage("Provide your timestamp"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { members, image_url, timestamp } = req.body;

    if (typeof members !== "object") {
      throw new BadRequestError("The list of frens or fans is incorrect");
    }

    const userLabel = await User.findById(members[0]);

    if (!userLabel) {
      throw new BadRequestError("Receiver not found");
    }
    let boomBox = await BoomBox.create({
      label: userLabel.username,
      image_url,
      user: req.currentUser?.id!,
      box_type: BoomBoxType.PRIVATE,
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
  "/api/v1/boom-box-messages/:boom_box",
  async (req: Request, res: Response) => {
    const response = new ApiResponse(
      Message.find({
        boom_box: req.params.boom_box,
        is_deleted: true,
        $or: [
          { receiver: req.currentUser?.id },
          { sender: req.currentUser?.id },
        ],
      })
        .populate("receiver", "username photo first_name last_name")
        .populate("sender", "username photo first_name last_name"),
      req.query
    )
      .sort()
      .limitFields();
    const messages = await response.query;
    res.status(200).json({
      status: "success",
      messages,
    });
  }
);

router.post(
  "/api/v1/boom-box-messages/:boom_box",
  [
    body("timestamp").notEmpty().withMessage("Provide the your timestamp"),
    body("content").notEmpty().withMessage("Message content cannot be empty"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { content, timestamp } = req.body;
    const message = await Message.create({
      boom_box: req.params.boom_box,
      sender: req.currentUser?.id!,
      content,
      created_at: new Date(timestamp),
    });

    res.status(200).json({
      status: "success",
      message,
    });
  }
);

router.get(
  "/api/v1/boom-box-messages/:boom_box/message/:id",
  async (req: Request, res: Response) => {
    const message = await Message.findOne({
      boom_box: req.params.boom_box,
      _id: req.params.id,
    });

    res.status(200).json({ message, status: "success" });
  }
);

router.patch(
  "/api/v1/boom-box-messages/:boom_box/message/:id",
  async (req: Request, res: Response) => {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      {
        is_deleted: true,
      },
      { new: true }
    );

    res.status(204).json({ message, status: "success" });
  }
);
export { router as messagesRouters };
