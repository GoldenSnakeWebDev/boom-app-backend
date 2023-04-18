import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { BadRequestError } from "../../errors";
import { requireAuth, validateRequest } from "../../middlewares";
import { User } from "../../models";
import { BoomBox, BoomBoxType } from "../../models/box";
import { ApiResponse } from "../../utils/api-response";
import { onSignalSendNotification } from "../../utils/on-signal";

const router = Router();

router.get(
  "/api/v1/boom-box",
  requireAuth,
  async (req: Request, res: Response) => {
    const response = new ApiResponse(
      BoomBox.find({ "members.user": req.currentUser?.id })
        .populate("user", "username photo first_name last_name")
        .populate("members.user", "username photo first_name last_name")
        .populate("messages.sender", "username photo first_name last_name"),
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
  }
);

router.post(
  "/api/v1/boom-box",
  [
    body("members")
      .notEmpty()
      .withMessage("Provide an list of your fans or frens"),
    body("is_group_chat")
      .isBoolean()
      .notEmpty()
      .withMessage("is the chat private?"),
    body("timestamp").notEmpty().withMessage("Provide your timestamp"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { members, label, image_url, timestamp, is_group_chat } = req.body;

    if (!is_group_chat) {
      const exists = await BoomBox.findOne({
        user: req.currentUser?.id,
        "members.user": members[0],
      })
        .populate("user", "username photo first_name last_name")
        .populate("members.user", "username photo first_name last_name")
        .populate("messages.sender", "username photo first_name last_name");
      if (exists) {
        return res.status(200).json({
          status: "success",
          boomBox: exists,
          message: `Successfully created ${exists.label}`,
        });
      }
    }

    if (typeof members !== "object") {
      throw new BadRequestError("The list of frens or fans is incorrect");
    }

    const users = await User.find({ _id: { $in: members } });

    if (users.length !== members.length) {
      throw new BadRequestError("Invalid members");
    }

    // if (!is_group_chat && members.length > 1) {
    //   throw new BadRequestError("This is not a group chat");
    // }
    let boomBox: any = await BoomBox.create({
      label: is_group_chat ? label : users[0].username,
      image_url,
      user: req.currentUser?.id!,
      box_type: is_group_chat ? BoomBoxType.PUBLIC : BoomBoxType.PRIVATE,
      members: [],
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

    if (is_group_chat) {
      newMembers.push({
        is_burnt: false,
        is_admin: true,
        user: req.currentUser?.id!,
        created_at: new Date(timestamp),
      });
      boomBox = await BoomBox.findByIdAndUpdate(
        boomBox.id,
        {
          $addToSet: { members: { $each: newMembers } },
          $push: {
            messages: {
              $each: [
                {
                  sender: req.currentUser?.id,
                  content: `${req.currentUser?.username}  created a BoomBox`,
                  created_at: new Date(timestamp),
                },
              ],
            },
          },
        },
        { new: true }
      )
        .populate("user", "username photo first_name last_name")
        .populate("members.user", "username photo first_name last_name")
        .populate("messages.sender", "username photo first_name last_name");
    } else {
      boomBox = await BoomBox.findByIdAndUpdate(
        boomBox.id,
        {
          $addToSet: { members: { $each: newMembers } },
          $push: {
            messages: {
              $each: [
                {
                  sender: req.currentUser?.id,
                  content: `${req.currentUser?.username}  started a chatting with you`,
                  created_at: new Date(timestamp),
                },
              ],
            },
          },
        },
        { new: true }
      )
        .populate("user", "username photo first_name last_name")
        .populate("members.user", "username photo first_name last_name")
        .populate("messages.sender", "username photo first_name last_name");
    }

    const notifiedUsers: Array<any> = boomBox.members
      .map((user: any) => {
        if (!user.user._id.equals(req.currentUser?.id!)) {
          return user;
        }
        return null;
      })
      .filter((i: any) => i);

    // Notify the user for first time
    notifiedUsers.forEach(async (user: any) => {
      const currentUser = await User.findById(user._id);
      await onSignalSendNotification({
        contents: {
          en: boomBox.messages[0].content,
          es: boomBox.messages[0].content,
        },
        included_segments: [currentUser?.device_id!],
        name: "DM",
      });
    });
    return res.status(200).json({
      status: "success",
      boomBox,
      message: `Successfully created ${boomBox.label}`,
    });
  }
);

router.post(
  "/api/v1/boom-box/:id/messages",
  [
    body("timestamp").notEmpty().withMessage("Provide your timestamp"),
    body("content").notEmpty().withMessage("Message is required"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { content, timestamp } = req.body;
    let boomBox = await BoomBox.findById(req.params.id)
      .populate("user", "username photo first_name last_name")
      .populate("members.user", "username photo first_name last_name")
      .populate("messages.sender", "username photo first_name last_name");
    if (!boomBox) {
      throw new BadRequestError("Boom Box not found");
    }
    if (
      !boomBox.members?.some((m: any) =>
        m.user._id.equals(req.currentUser?.id!)
      )
    ) {
      throw new BadRequestError("Forbidden");
    }

    const notifiedUsers: Array<any> = boomBox.members
      .map((user: any) => {
        if (!user.user._id.equals(req.currentUser?.id!)) {
          return user;
        }
        return null;
      })
      .filter((i: any) => i);

    boomBox = await BoomBox.findByIdAndUpdate(
      boomBox.id,
      {
        $push: {
          messages: {
            $each: [
              {
                sender: req.currentUser?.id,
                content: `${content}`,
                created_at: new Date(timestamp),
              },
            ],
          },
        },
      },
      { new: true }
    )
      .populate("user", "username photo first_name last_name")
      .populate("members.user", "username photo first_name last_name")
      .populate("messages.sender", "username photo first_name last_name");

    // Notify the user for first time
    notifiedUsers.forEach(async (user: any) => {
      const currentUser = await User.findById(user._id);
      await onSignalSendNotification({
        contents: {
          en: `You have received a messsage from ${req.currentUser?.username} in ${boomBox?.label}`,
          es: `You have received a messsage from ${req.currentUser?.username} in ${boomBox?.label}`,
        },
        included_segments: [currentUser?.device_id!],
        name: "DM",
      });
    });

    res.status(200).json({
      status: "success",
      boomBox,
      message: `Sent`,
    });
  }
);

router.get(
  "/api/v1/boom-box/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const boomBox = await BoomBox.findById(req.params.id)
      .populate("user", "username photo first_name last_name")
      .populate("members.user", "username photo first_name last_name")
      .populate("messages.sender", "username photo first_name last_name");
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
  "/api/v1/boom-box/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const boomBox = await BoomBox.findById(req.params.id);
    if (!boomBox) {
      throw new BadRequestError("The boombox was not found");
    }

    const boomQuery = await BoomBox.findOne({
      _id: req.params.id,
      "members.user": req.currentUser?.id,
    }).populate("members.user", "username photo first_name last_name is_admin");

    if (!boomQuery) {
      throw new BadRequestError("Boom not found");
    }

    if (boomBox.user?.toString() !== req.currentUser?.id) {
      throw new BadRequestError("You are not allowed to perform this task");
    }
    await BoomBox.findByIdAndDelete(boomBox.id);

    res.status(204).json({});
  }
);

export { router as BoomBoxRoutes };
