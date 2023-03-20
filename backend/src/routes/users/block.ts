import { Request, Response, Router } from "express";
import { requireAuth, validateRequest } from "../../middlewares";
import { body } from "express-validator";
import { BadRequestError } from "../../errors";
import { User } from "../../models";

const router = Router();
/**
 * @openapi
 * /api/v1/users/block:
 *   post:
 *     tags:
 *        - Block User
 *     description: Enables a user to block another user
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: userId
 *          description: Please provide a userId
 *     responses:
 *       200:
 *         description: Enable user to block and another user
 */
router.post(
  "/api/v1/users/block",
  [body("userId").notEmpty().withMessage("please provide the userId")],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { userId } = req.body;

    const existUser = await User.findById(userId);

    if (!existUser) {
      throw new BadRequestError("The account user not available");
    }

    let user: any;
    let action = "blocked";

    const myAccount = await User.findById(req.currentUser?.id);
    if (!myAccount) {
      throw new BadRequestError("Your account was not found");
    }

    const isUserInlistOfBlockedUser =
      myAccount?.blocked_users?.includes(userId);

    if (!isUserInlistOfBlockedUser) {
      // add user to a list of your blocked users
      user = await User.findByIdAndUpdate(
        req.currentUser?.id,
        { $push: { blocked_users: userId } },
        { new: true }
      );
      // blocked user
      action = "blocked";
    } else {
      //remove user from bocked users
      user = await User.findByIdAndUpdate(
        req.currentUser?.id,
        { $pull: { blocked_users: userId } },
        { new: true }
      );
      action = "un-blocked";
    }

    res.status(200).json({
      status: "success",
      user,
      message: `Successfully ${action} ${existUser.username}`,
    });
  }
);

export { router as BlockUserRoutes };
