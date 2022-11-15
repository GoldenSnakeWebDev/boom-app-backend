import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { Nofitication, NotificationType } from "./../../models";
import { validateRequest } from "../../middlewares/validate-request";
import { requireAuth } from "../../middlewares/require-auth";
import { ApiResponse } from "../../utils/api-response";

const router = Router();

/**
 * @openapi
 * /api/v1/notification-types:
 *   get:
 *     tags:
 *        - Notifications
 *     description: List of Notification types  available to for the boom platform.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of notification types.
 */
router.get(
  "/api/v1/notification-types",
  async (_req: Request, res: Response) => {
    res.status(200).json({
      status: "success",
      notification_types: Object.values(NotificationType),
    });
  }
);

/**
 * @openapi
 * /api/v1/notifications:
 *   get:
 *     tags:
 *        - Notifications
 *     description: List all epics or tales.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . list all epics epic/tales
 */

router.get(
  "/api/v1/notifications",
  requireAuth,
  async (req: Request, res: Response) => {
    const response = new ApiResponse(
      Nofitication.find({ user: req.currentUser?.id })
        .populate("user")
        .populate("boom"),
      req.query
    )
      .filter()
      .sort()
      .limitFields();

    // const count = await response.query;

    const notifications = await response.paginate().query;

    res.status(200).json({
      status: "success",
      page: response?.page_info,
      // count: count.length,
      notifications,
    });
  }
);

/**
 * @openapi
 * /api/v1/notifications:
 *   post:
 *     tags:
 *        - Notifications
 *     description: Create a new notification.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: message
 *          description: Your notification message
 *        - name: notification_type
 *          description: Please provide your notificationtype
 *     responses:
 *       200:
 *         description: . list all epics epic/tales
 */

router.post(
  "/api/v1/notifications",
  [
    body("message").notEmpty().withMessage("please provide your message"),
    body("notification_type")
      .notEmpty()
      .withMessage("what notification are you trying to create?"),
    body("boomId")
      .notEmpty()
      .withMessage("Which boom are creating notification for?"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const [message, boomId, notification_type] = req.body;

    const notification = new Nofitication({
      message,
      boom: boomId,
      notification_type,
    });

    await notification.save();
    res.status(201).json({
      status: "success",
      notification,
    });
  }
);

/**
 * @openapi
 * /api/v1/notifications/:id:
 *   patch:
 *     tags:
 *        - Notifications
 *     description: Mark noitification as read.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Mark notification as read
 */

router.patch(
  "/api/v1/notifications/:id",
  [
    body("message").notEmpty().withMessage("please provide your message"),
    body("notification_type")
      .notEmpty()
      .withMessage("what notification are you trying to create?"),
    body("boomId")
      .notEmpty()
      .withMessage("Which boom are creating notification for?"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const notification = await Nofitication.findByIdAndUpdate(
      req.params.id,
      {
        is_read: true,
      },
      { new: true }
    );

    res.status(201).json({
      status: "success",
      notification,
    });
  }
);

export { router as NofiticationRoutes };
