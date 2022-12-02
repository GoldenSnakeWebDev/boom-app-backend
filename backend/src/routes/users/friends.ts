import { Request, Response, Router } from "express";
import { NotificationType, Notification } from "./../../models/notification";
import { requireAuth } from "../../middlewares/require-auth";
import { User } from "../../models/user";

const router = Router();

/**
 * @openapi
 * /api/v1/friends/:id:
 *   patch:
 *     tags:
 *        - Auth
 *     description: Follow uses.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Your new following.
 */
router.patch(
  "/api/v1/friends/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const user = await User.findById(req.currentUser?.id)
      .populate("sync_bank")
      .populate("friends")
      .populate("funs");

    if (req.currentUser?.id === req.params.id) {
      res.status(200).json({
        status: "success",
        user,
      });
    }

    let nextUser = await User.findById(req.params.id);

    const areYouNextUserFun = nextUser?.funs
      ?.map((item) => item.toString())
      .includes(req.currentUser?.id!);

    if (!areYouNextUserFun) {
      nextUser = await User.findByIdAndUpdate(
        req.currentUser?.id,
        { $push: { funs: req.params.id } },
        { new: true }
      );

      // send notification for tipper
      // TODO: Notification
      await Notification.create({
        notification_type: NotificationType.USER,
        user: req.currentUser?.id,
        message: `You have added ${nextUser?.username} as your fun`,
      });
    } else {
      // remove being a friend
      nextUser = await User.findByIdAndUpdate(
        req.currentUser?.id,
        { $pull: { funs: req.params.id } },
        { new: true }
      );
      // TODO: Notification
      await Notification.create({
        notification_type: NotificationType.USER,
        user: req.currentUser?.id,
        message: `You have removed ${nextUser?.username} from a list of your funs`,
      });
    }

    const isSenderYourFun = user?.funs
      ?.map((item) => item.toString())
      .includes(req.currentUser?.id!);

    if (
      nextUser?.funs
        ?.map((item) => item.toString())
        .includes(req.currentUser?.id!) ||
      isSenderYourFun
    ) {
      await User.findByIdAndUpdate(
        req.params.id,
        { $push: { friends: req.currentUser?.id } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        req.currentUser?.id,
        { $push: { friends: req.params.id } },
        { new: true }
      );

      // TODO: Notification
      await Notification.create({
        notification_type: NotificationType.USER,
        user: req.currentUser?.id,
        message: `${nextUser?.username} is now your friend`,
      });

      // TODO: Notification
      await Notification.create({
        notification_type: NotificationType.USER,
        user: req.params.id,
        message: `${req.currentUser?.username} is now your friend`,
      });
    } else {
      await User.findByIdAndUpdate(
        req.params.id,
        { $pull: { friends: req.currentUser?.id } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        req.currentUser?.id,
        { $pull: { friends: req.params.id } },
        { new: true }
      );
    }

    res.status(200).json({
      status: "success",
      user: await User.findById(req.currentUser?.id)
        .populate("sync_bank")
        .populate("friends", "username photo first_name last_name")
        .populate("funs", "username photo first_name last_name"),
    });
  }
);

export { router as FriendsFollowersRoutes };
