import { Router, Response, Request } from "express";
import { BoomBox, BoomBoxType } from "./../../models/boom-box";
import { User } from "./../../models/user";
import { requireAuth } from "../../middlewares/require-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { body } from "express-validator";
import { BadRequestError } from "../../errors/bad-request-error";

const router = Router();

/**
 * @openapi
 * /api/v1/boom-box-types:
 *   get:
 *     tags:
 *        - BoomBox
 *     description: List of all boom Box Type
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of boom types.
 */
router.get("/api/v1/boom-box-types", async (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "success", boom_box_types: Object.values(BoomBoxType) });
});

/**
 * @openapi
 * /api/v1/boom-boxes:
 *   get:
 *     tags:
 *        - BoomBox
 *     description: List my DMS.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of booms.
 */
router.get(
  "/api/v1/boom-boxes",
  requireAuth,
  async (req: Request, res: Response) => {
    const boom_box = await BoomBox.find({
      $or: [
        { "messages.author": req.currentUser?.id },
        { "messages.receiver": req.currentUser?.id },
      ],
      box_type: "public",
    })
      .populate("messages.author", "username photo first_name last_name")
      .populate("messages.receiver", "username photo first_name last_name");

    res.status(200).json({
      status: "success",
      boom_box,
    });
  }
);

/**
 * @openapi
 * /api/v1/boom-boxes/:box/messages:
 *   get:
 *     tags:
 *        - BoomBox
 *     description: Get  DMS.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . DMs.
 */
router.get(
  "/api/v1/boom-boxes/:box/messages",
  requireAuth,
  async (req: Request, res: Response) => {
    const boom_box = await BoomBox.findOne({
      box: req.params.box,
      box_type: "public",
    })

      .populate("messages.author", "username photo first_name last_name")
      .populate("messages.receiver", "username photo first_name last_name");

    res.status(200).json({
      status: "success",
      boom_box,
    });
  }
);

/**
 * @openapi
 * /api/v1/boom-box:
 *   post:
 *     tags:
 *        - BoomBox
 *     description: Chart with user
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: command
 *          description: join_room, send_message
 *        - name:  box
 *          description: Provide provide the box `box`
 *        - name: content
 *          description: Message content
 *        - name: author
 *          description: Current logged in user's id
 *        - name: receiver
 *          description: The reciever Id
 *        - name: timestamp
 *          description: Your current timestamp send from the send's phone  (app)
 *        - name:  boombox_type
 *          description: The boom type is optional default is public, other is privave
 *     responses:
 *       200:
 *         description: . Chart with user .
 */
router.post(
  "/api/v1/boom-box",
  [
    body("command").notEmpty().withMessage("Please provide a command"),
    body("content").notEmpty().withMessage("Please provide your message"),
    body("author")
      .notEmpty()
      .withMessage("Please provide who is sending to message and to who"),
    body("receiver")
      .notEmpty()
      .withMessage("Please provide who is sending to message and to who"),
    body("timestamp").notEmpty().withMessage("Please provide your timestamp"),
  ],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    const { content, box, author, receiver, timestamp, command, boombox_type } =
      req.body;

    let boomBox = await BoomBox.findOne({ box: box });
    const receiverUser = await User.findById(receiver).populate("sync_bank");
    const builMessage = {
      content: content!,
      author: author,
      receiver: receiver,
      is_delete: false,
      timestamp: new Date(timestamp),
    };

    if (command === "join_room") {
      const existBoom = await BoomBox.find({
        $or: [
          {
            $and: [
              { "messages.author": req.currentUser?.id },
              { "messages.receiver": receiver },
            ],
          },
          {
            $and: [
              { "messages.author": receiver },
              { "messages.receiver": req.currentUser?.id },
            ],
          },
        ],
      });
      if (existBoom) {
        throw new BadRequestError(
          `You already have a chat with ${receiverUser?.username}`
        );
      }
    }

    if (boomBox) {
      if (boomBox.messages?.length != 0) {
        boomBox = await BoomBox.findByIdAndUpdate(
          boomBox.id,
          { $push: { messages: builMessage } },
          { new: true }
        )
          .populate(
            "messages.author",
            "username photo first_name last_name _id"
          )
          .populate(
            "messages.receiver",
            "username photo first_name last_name  _id"
          );
      }

      res.status(200).json({ status: "success", boomBox });
    } else {
      // create boom box and
      boomBox = new BoomBox({
        box: `${author}:${Date.now()}`,
        label: receiverUser?.username
          ? `${receiverUser?.username}`
          : `${receiverUser?.first_name!} ${receiverUser?.last_name!}`,
        box_type:
          boombox_type === "private" ? BoomBoxType.PRIVATE : BoomBoxType.PUBLIC,
        messages: builMessage,
      });

      await boomBox.save();
    }

    res.status(200).json({
      status: "success",
      boom_box: await BoomBox.findById(boomBox?.id)
        .populate("messages.author", "username photo first_name last_name")
        .populate("messages.receiver", "username photo first_name last_name"),
    });
  }
);
export { router as BoomBoxRoutes };
