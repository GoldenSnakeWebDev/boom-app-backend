import { Request, Response, Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import { User } from "../../models/user";
import { NotAuthorizedError } from "../../errors/not-authorized-error";
// import { BadRequestError } from "../../errors/bad-request-error";

const router = Router();

/**
 * @openapi
 * /api/v1/friends/:id:
 *   get:
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
router.get(
  "/api/v1/friends/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const user = await User.findById(req.currentUser?.id).populate("sync_bank");

    if (!user) {
      throw new NotAuthorizedError();
    }
    res.status(200).json({
      status: "success",
      user,
    });
  }
);

export { router as FriendsFollowersRoutes };
