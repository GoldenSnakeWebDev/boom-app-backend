import { Request, Response, Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import { User } from "../../models/user";
import { NotAuthorizedError } from "../../errors/not-authorized-error";
// import { BadRequestError } from "../../errors/bad-request-error";

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
    const user = await User.findById(req.currentUser?.id).populate("sync_bank");

    if (req.currentUser?.id === req.params.id) {
      res.status(200).json({
        status: "success",
        user,
      });
    }

    if (
      user?.funs?.map((item) => item.toString()).includes(req.currentUser?.id!)
    ) {
      await User.findByIdAndUpdate(req.params.id, {
        $push: { followers: req.currentUser?.id },
      });
    } else {
      await User.findByIdAndUpdate(req.params.id, {
        $push: { funs: req.currentUser?.id },
      });
    }

    await User.findByIdAndUpdate(req.currentUser?.id, {
      $push: { funs: req.params.id },
    });

    if (!user) {
      throw new NotAuthorizedError();
    }
    res.status(200).json({
      status: "success",
      user: await User.findById(req.currentUser?.id)
        .populate("sync_bank")
        .populate("funs")
        .populate("followers")
        .populate("following"),
    });
  }
);

export { router as FriendsFollowersRoutes };
