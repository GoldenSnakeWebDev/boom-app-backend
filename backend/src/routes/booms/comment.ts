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

    const boom = await Boom.findById(req.params.boomId);

    if (!boom) {
      throw new BadRequestError("This boom does not exist");
    }

    const comment = new Comment({
      message,
      user: req.currentUser?.id!,
      boom: req.params.boomId,
    });

    await comment.save();

    await Boom.findByIdAndUpdate(boom.id, {
      $push: {
        comments: comment.id,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Successfully create a new comment",
      comment,
    });
  }
);

/**
 * @openapi
 * /api/v1/booms/:boomId/comments:
 *   patch:
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
router.patch(
  "/api/v1/booms/:boomId/comments/:id",
  [
    body("message")
      .notEmpty()
      .withMessage("please provide your comment message"),
  ],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    let { message } = req.body;

    const comment = Comment.findByIdAndUpdate(
      req.params.id,
      { message },
      { new: true }
    );

    res.status(201).json({
      status: "success",
      message: "Successfully updated comment",
      comment,
    });
  }
);
export { router as CommentRoutes };
