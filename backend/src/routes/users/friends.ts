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
// router.patch(
//   "/api/v1/friends/:id",
//   requireAuth,
//   async (req: Request, res: Response) => {
//     // User A
//     const user = await User.findById(req.currentUser?.id)
//       .populate("sync_bank")
//       .populate("friends")
//       .populate("funs");

//     if (req.currentUser?.id === req.params.id) {
//       res.status(200).json({
//         status: "success",
//         user,
//       });
//     }

//     // User B
//     let nextUser = await User.findById(req.params.id);

//     const areYouNextUserFun = nextUser?.funs
//       ?.map((item) => item.toString())
//       .includes(req.currentUser?.id!);

//     if (!areYouNextUserFun) {
//       nextUser = await User.findByIdAndUpdate(
//         req.params.id,
//         { $push: { funs: req.currentUser?.id } },
//         { new: true }
//       );

//       // send notification for tipper
//       // TODO: Notification
//       const msgFriend = `You are now a fan of ${nextUser?.username}`;
//       await Notification.create({
//         notification_type: NotificationType.USER,
//         user: req.currentUser?.id,
//         message: msgFriend,
//       });

//       if (req.currentUser?.device_id!) {
//         onSignalSendNotification({
//           contents: {
//             en: msgFriend,
//             es: msgFriend,
//           },
//           include_external_user_id: [req.currentUser?.device_id!],
//           name: "Fun",
//         });
//       }
//     } else {
//       // remove being a friend
//       nextUser = await User.findByIdAndUpdate(
//         req.params.id,
//         { $pull: { funs: req.currentUser?.id } },
//         { new: true }
//       );
//       // TODO: Notification
//       const msgRemovedFrd = `You have removed ${nextUser?.username} from your list of Fans`;
//       await Notification.create({
//         notification_type: NotificationType.USER,
//         user: nextUser?.id,
//         message: msgRemovedFrd,
//       });

//       if (nextUser?.device_id!) {
//         onSignalSendNotification({
//           contents: {
//             en: msgRemovedFrd,
//             es: msgRemovedFrd,
//           },
//           include_external_user_id: [nextUser?.device_id!],
//           name: "Fun",

//         });
//       }
//     }

//     console.log("Current User FANS: ", user?.funs);
//     console.log("NextUser Fans: ", nextUser?.funs);
//     const isSenderYourFun = nextUser?.funs
//       ?.map((item) => item.toString())
//       .includes(req.currentUser?.id!);
//     //
//     const loggedUserFans = user?.funs
//       ?.map((item) => item.toString())
//       .includes(req.params.id)

//     if (loggedUserFans && isSenderYourFun) {
//       await User.findByIdAndUpdate(
//         req.currentUser?.id,
//         { $push: { friends: req.params.id } },
//         { new: true }
//       );
//       await User.findByIdAndUpdate(
//         req.params.id,
//         { $push: { friends: req.currentUser?.id } },
//         { new: true }
//       );

//       // TODO: Notification
//       const msgFrd = `You have added ${nextUser?.username} as your fren`;
//       await Notification.create({
//         notification_type: NotificationType.USER,
//         user: nextUser?.id,
//         message: msgFrd,
//       });

//       if (req.currentUser?.device_id!) {
//         onSignalSendNotification({
//           contents: {
//             en: msgFrd,
//             es: msgFrd,
//           },
//           include_external_user_id: [req.currentUser?.device_id!],
//           name: "frens",
//         });
//       }

//       // TODO: Notification
//       await Notification.create({
//         notification_type: NotificationType.USER,
//         user: req.params.id,
//         message: `${req.currentUser?.username} is now your fren`,
//       });
//       if (nextUser?.device_id!) {
//         onSignalSendNotification({
//           contents: {
//             en: `${req.currentUser?.username} is now your fren`,
//             es: `${req.currentUser?.username} is now your fren`,
//           },
//           include_external_user_id: [nextUser?.device_id!],
//           name: "Fun",
//         });
//       }
//     } else {
//       await User.findByIdAndUpdate(
//         req.params.id,
//         { $pull: { friends: req.currentUser?.id } },
//         { new: true }
//       );
//       await User.findByIdAndUpdate(
//         req.currentUser?.id,
//         { $pull: { friends: req.params.id } },
//         { new: true }
//       );

//       // TODO: Notification
//       await Notification.create({
//         notification_type: NotificationType.USER,
//         user: nextUser?.id,
//         message: `${nextUser?.username} not your fren`,
//       });

//       // TODO: Notification
//       await Notification.create({
//         notification_type: NotificationType.USER,
//         user: req.currentUser?.id,
//         message: `${req.currentUser?.username} not your fren`,
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       user: await User.findById(req.currentUser?.id)
//         .populate("sync_bank")
//         .populate("friends", "username photo first_name last_name")
//         .populate("funs", "username photo first_name last_name"),
//     });
//   }
// );



router.patch(
  "/api/v1/friends/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const currentUser = await User.findById(req.currentUser?.id)
        .populate("sync_bank")
        .populate("friends")
        .populate("funs");

      const nextUser = await User.findById(req.params.id)
        .populate("funs");

      if (req.currentUser?.id === req.params.id) {
        return res.status(200).json({
          status: "success",
          user: currentUser,
        });
      }

      await handleAddingOrRemovingFan(req, currentUser, nextUser);

      await handleAddingOrRemovingFriend(req, currentUser, nextUser);

      res.status(200).json({
        status: "success",
        user: await User.findById(req.currentUser?.id)
          .populate("sync_bank")
          .populate("friends", "username photo first_name last_name")
          .populate("funs", "username photo first_name last_name"),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "error",
        message: "An error occurred",
      });
    }
    return;
  }
);



/***
 * handle  adding or removing of Fan
 */
async function handleAddingOrRemovingFan(req: Request, _currentUser: any, nextUser: any) {
  const areYouNextUserFun = nextUser?.funs
    ?.map((item: any) => item.toString())
    .includes(req.currentUser?.id!);

  if (!areYouNextUserFun) {
    await User.findByIdAndUpdate(
      req.params.id,
      { $push: { funs: req.currentUser?.id } },
      { new: true }
    );

    await sendNotification(req.currentUser, nextUser, `${nextUser?.username} is now your fan`);
  } else {
    await User.findByIdAndUpdate(
      req.params.id,
      { $pull: { funs: req.currentUser?.id } },
      { new: true }
    );
    await sendNotification(req.currentUser, nextUser, `${nextUser?.username} is no longer your fan`);
  }
}

/***
 * handle adding or removing of Friend to user profile
 */
async function handleAddingOrRemovingFriend(req: Request, currentUser: any, nextUser: any) {
  const isSenderYourFriend = nextUser?.funs
    ?.map((item: any) => item.toString())
    .includes(req.currentUser?.id!);

  const loggedUserFriend = currentUser?.funs
    ?.map((item: any) => item.toString())
    .includes(req.params.id);

  if (loggedUserFriend && isSenderYourFriend) {
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

    await sendNotification(req.currentUser, nextUser, `${nextUser?.username} is now your friend`);
    await sendNotification(nextUser, req.currentUser, `${req.currentUser?.username} is now your friend`);
  } else {
    await User.findByIdAndUpdate(
      req.params.id,
      { $pull: { friends: req.currentUser?.id } },
      { new: true }
    );
    // await User.findByIdAndUpdate(
    //   req.currentUser?.id,
    //   { $pull: { friends: req.params.id } },
    //   { new: true }
    // );

    await sendNotification(nextUser, req.currentUser, `${req.currentUser?.username} is no longer your friend`);
    await sendNotification(req.currentUser, nextUser, `${nextUser?.username} is no longer your friend`);
  }
}

/***
 * Handle sending notification 
 */
async function sendNotification(_sender: any, receiver: any, message: string) {
  if (receiver.device_id) {
    await Notification.create({
      notification_type: NotificationType.USER,
      user: receiver.id,
      message: message,
    });

    onSignalSendNotification({
      contents: {
        en: message,
        es: message,
      },
      include_external_user_id: [receiver.device_id],
      name: "Fun", // Name could be "frens" or "Fun" based on your use case
    });
  }
}

export { router as FriendsFollowersRoutes };
