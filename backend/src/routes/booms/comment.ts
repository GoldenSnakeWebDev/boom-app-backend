import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { Comment } from "../../models/comment";
import { Boom, User } from "../../models";
import { validateRequest } from "../../middlewares";
import { requireAuth } from "../../middlewares";
import { BadRequestError } from "../../errors";
import { Notification, NotificationType } from "../../models";
import { onSignalSendNotification } from "../../utils/on-signal";

const router = Router();

/**
 * @openapi
 * /api/v1/booms/:boomId/comments:
 *   post:
 *     tags:
 *        - Boom Comments
 *     description: Enables  users to comment on at boom.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: message
 *          description: Please provide your message
 *        - name: boom
 *          description: Please provide your boom
 *        - name: timestamp
 *          description:  Provide the timestamp in the format e.g '11/25/2022, 5:12:29 PM'
 *     responses:
 *       200:
 *         description: . Successfully created a message
 */
router.post(
  "/api/v1/booms/:boomId/comments",
  [
    body("message")
      .notEmpty()
      .withMessage("please provide your comment message"),
    body("timestamp")
      .notEmpty()
      .withMessage("please provide comment timestamp"),
  ],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    let { message, timestamp } = req.body;

    let boom = await Boom.findById(req.params.boomId);

    if (!boom) {
      throw new BadRequestError("This boom does not exist");
    }

    const boomOwner = await User.findById(boom.user);

    if (!boomOwner) {
      throw new BadRequestError("Boom  User not found");
    }

    const comment = new Comment({
      message,
      user: req.currentUser?.id!,
      boom: req.params.boomId,
      created_at: new Date(timestamp),
    });

    await comment.save();

    const notification = await Notification.create({
      notification_type: NotificationType.BOOM,
      user: req.currentUser?.id,
      boom: req.params.boomId,
      message: `${req.currentUser?.username} commented on your boom`,
      timestamp: new Date(timestamp),
    });

    await onSignalSendNotification({
      contents: { en: notification.message, es: notification.message },
      include_external_user_id: [boomOwner?.device_id!],
      name: "Comment",
    });

    boom = await Boom.findByIdAndUpdate(
      boom.id,
      {
        $push: {
          comments: comment.id,
        },
      },
      { new: true }
    )
      .populate("network")
      .populate("reactions.likes", "username photo first_name last_name")
      .populate("reactions.loves", "username photo first_name last_name")
      .populate("reactions.smiles", "username photo first_name last_name")
      .populate("reactions.rebooms", "username photo first_name last_name")
      .populate("reactions.reports", "username photo first_name last_name")
      .populate("user")
      .populate("comments")
      .populate("comments.user", "username photo first_name last_name");

    res.status(201).json({
      status: "success",
      message: "Successfully create a new comment",
      boom,
    });
  }
);

/**
 * @openapi
 * /api/v1/booms/:boomId/comments/:id:
 *   patch:
 *     tags:
 *        - Boom Comments
 *     description: Use this endpoint to like a comment.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . update your comment
 */
router.patch(
  "/api/v1/booms/:boomId/comments/:id",
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    let { message } = req.body;

    Comment.findByIdAndUpdate(
      req.params.id,
      { message, $push: { like: req.currentUser?.id } },
      { new: true }
    );

    let boom = await Boom.findById(req.params.boomId)
      .populate("network")
      .populate("reactions.likes", "username photo first_name last_name")
      .populate("reactions.loves", "username photo first_name last_name")
      .populate("reactions.smiles", "username photo first_name last_name")
      .populate("reactions.rebooms", "username photo first_name last_name")
      .populate("reactions.reports", "username photo first_name last_name")
      .populate("user", "username photo first_name last_name")
      .populate("comments")
      .populate("comments.user", "username photo first_name last_name");
    res.status(200).json({
      status: "success",
      message: "Successfully updated comment",
      boom,
    });
  }
);
export { router as CommentRoutes };
