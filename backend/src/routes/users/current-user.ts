import { Request, Response, Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import { User } from "../../models/user";
import { NotAuthorizedError } from "../../errors/not-authorized-error";

const router = Router();

/**
 * @openapi
 * /api/v1/users/currentuser:
 *   get:
 *     tags:
 *        - Auth
 *     description: Get the current logged user profile information.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a user object.
 */
router.get(
  "/api/v1/users/currentuser",
  requireAuth,
  async (req: Request, res: Response) => {
    console.log(req.currentUser);
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

export { router as CurrentUserRoutes };