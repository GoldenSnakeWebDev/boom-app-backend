import { Request, Response, Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import { User } from "../../models/user";
import { NotAuthorizedError } from "../../errors/not-authorized-error";
import { BadRequestError } from "../../errors/bad-request-error";

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
    const user = await User.findById(req.currentUser?.id)
      .populate("sync_bank")
      .populate("friends")
      .populate("funs");

    if (!user) {
      throw new NotAuthorizedError();
    }
    res.status(200).json({
      status: "success",
      user,
    });
  }
);

/**
 * @openapi
 * /api/v1/users/:id:
 *   get:
 *     tags:
 *        - Auth
 *     description: Get a user's profile info by id.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Get a user's profile info by id.
 */
router.get("/api/v1/users/:id", async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id)
    .populate("sync_bank")
    .populate("friends", "username photo first_name last_name")
    .populate("funs", "username photo first_name last_name");

  if (!user) {
    throw new BadRequestError("User not found");
  }
  res.status(200).json({
    status: "success",
    user,
  });
});

export { router as CurrentUserRoutes };
