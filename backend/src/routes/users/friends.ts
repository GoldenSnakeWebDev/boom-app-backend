import { Request, Response, Router } from "express";
import { NotificationType, Notification } from "./../../models/notification";
import { requireAuth } from "../../middlewares/require-auth";
import { User } from "../../models/user";
import { onSignalSendNotification } from "../../utils/on-signal";

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
    // User A
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

    // User B
    let nextUser = await User.findById(req.params.id);

    const areYouNextUserFun = nextUser?.funs
      ?.map((item) => item.toString())
      .includes(req.currentUser?.id!);

    if (!areYouNextUserFun) {
      nextUser = await User.findByIdAndUpdate(
        req.params.id,
        { $push: { funs: req.currentUser?.id } },
        { new: true }
      );

      // send notification for tipper
      // TODO: Notification
      const msgFriend = `You are now a fan of ${nextUser?.username}`;
      await Notification.create({
        notification_type: NotificationType.USER,
        user: req.currentUser?.id,
        message: msgFriend,
      });

      if (req.currentUser?.device_id!) {
        onSignalSendNotification({
          contents: {
            en: msgFriend,
            es: msgFriend,
          },
          include_external_user_id: [req.currentUser?.device_id!],
          name: "Friends",
        });
      }
    } else {
      // remove being a friend
      nextUser = await User.findByIdAndUpdate(
        req.params.id,
        { $pull: { funs: req.currentUser?.id } },
        { new: true }
      );
      // TODO: Notification
      const msgRemovedFrd = `You have removed ${nextUser?.username} from your list of Fans`;
      await Notification.create({
        notification_type: NotificationType.USER,
        user: nextUser?.id,
        message: msgRemovedFrd,
      });

      if (nextUser?.device_id!) {
        onSignalSendNotification({
          contents: {
            en: msgRemovedFrd,
            es: msgRemovedFrd,
          },
          include_external_user_id: [nextUser?.device_id!],
          name: "Friends",
        });
      }
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
        req.currentUser?.id,
        { $push: { friends: req.params.id } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        req.params.id,
        { $push: { friends: req.currentUser?.id } },
        { new: true }
      );

      // TODO: Notification
      const msgFrd = `You have added ${nextUser?.username} as your fren`;
      await Notification.create({
        notification_type: NotificationType.USER,
        user: nextUser?.id,
        message: msgFrd,
      });

      if (req.currentUser?.device_id!) {
        onSignalSendNotification({
          contents: {
            en: msgFrd,
            es: msgFrd,
          },
          include_external_user_id: [req.currentUser?.device_id!],
          name: "frens",
        });
      }

      // TODO: Notification
      await Notification.create({
        notification_type: NotificationType.USER,
        user: req.params.id,
        message: `${req.currentUser?.username} is now your fren`,
      });
      if (nextUser?.device_id!) {
        onSignalSendNotification({
          contents: {
            en: `${req.currentUser?.username} is now your fren`,
            es: `${req.currentUser?.username} is now your fren`,
          },
          include_external_user_id: [nextUser?.device_id!],
          name: "Friends",
        });
      }
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

      // TODO: Notification
      await Notification.create({
        notification_type: NotificationType.USER,
        user: nextUser?.id,
        message: `${nextUser?.username} not your fren`,
      });

      // TODO: Notification
      await Notification.create({
        notification_type: NotificationType.USER,
        user: req.currentUser?.id,
        message: `${req.currentUser?.username} not your fren`,
      });
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
