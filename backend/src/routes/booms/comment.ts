import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { Comment } from "./../../models/comment";
import { Boom } from "./../../models/boom";
import { validateRequest } from "../../middlewares/validate-request";
import { requireAuth } from "../../middlewares/require-auth";
import { BadRequestError } from "../../errors/bad-request-error";

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
  ],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    let { message } = req.body;

    let boom = await Boom.findById(req.params.boomId);

    if (!boom) {
      throw new BadRequestError("This boom does not exist");
    }

    const comment = new Comment({
      message,
      user: req.currentUser?.id!,
      boom: req.params.boomId,
    });

    await comment.save();

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
      .populate("reactions.likes")
      .populate("reactions.loves")
      .populate("reactions.smiles")
      .populate("reactions.rebooms")
      .populate("reactions.reports")
      .populate("user")
      .populate("comments")
      .populate("comments.user");

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
      .populate("reactions.likes")
      .populate("reactions.loves")
      .populate("reactions.smiles")
      .populate("reactions.rebooms")
      .populate("reactions.reports")
      .populate("user")
      .populate("comments")
      .populate("comments.user");
    res.status(200).json({
      status: "success",
      message: "Successfully updated comment",
      boom,
    });
  }
);
export { router as CommentRoutes };
