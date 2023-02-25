import { Request, Response, Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import { User } from "../../models/user";
import { NotAuthorizedError } from "../../errors/not-authorized-error";
import { BadRequestError } from "../../errors/bad-request-error";
import { requireSuperAdmin } from "../../middlewares/require-super-admin";

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
      .populate("friends", "username photo first_name last_name")
      .populate("funs", "username photo first_name last_name");

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

/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     tags:
 *        - Auth
 *     description: Get a list of all users .
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a list of all users.
 */
router.get(
  "/api/v1/users",
  requireAuth,
  async (req: Request, res: Response) => {
    const users = await User.find({
      $nor: [{ is_admin: true, _id: req.currentUser?.id }],
    }).select("username photo first_name last_name");

    if (!users) {
      throw new BadRequestError("User not found");
    }
    res.status(200).json({
      status: "success",
      users,
    });
  }
);

/**
 * @openapi
 * /api/v1/users-list:
 *   get:
 *     tags:
 *        - Auth
 *     description: Get a list of all users .
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a list of all users.
 */
router.get(
  "/api/v1/users-list",
  requireAuth,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    const users = await User.find({
      $nor: [{ is_admin: true, _id: req.currentUser?.id }],
    });

    if (!users) {
      throw new BadRequestError("User not found");
    }
    res.status(200).json({
      status: "success",
      users,
    });
  }
);

//users/burn-admin-account

/**
 * @openapi
 * /api/v1/users/burn-admin-account/:id:
 *   get:
 *     tags:
 *        - Auth
 *     description: Get a list of all users .
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a list of all users.
 */
router.patch(
  "/api/v1/users/burn-admin-account/:id",
  requireAuth,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new BadRequestError("User not found");
    }

    const newUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        is_active: !user.is_active,
      },
      { new: true }
    );

    /**
     * Burn user
     */
    res.status(200).json({
      status: "success",
      message: "Sucessfully burnt account",
      user: newUser,
    });
  }
);
export { router as CurrentUserRoutes };
