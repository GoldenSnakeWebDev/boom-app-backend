import { Request, Response, Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import { User } from "../../models/user";
import { NotAuthorizedError } from "../../errors/not-authorized-error";
import { BadRequestError } from "../../errors/bad-request-error";
import { requireSuperAdmin } from "../../middlewares/require-super-admin";
import { ApiResponse } from "../../utils/api-response";
import { Token } from "../../models/token";

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
      .populate("funs", "username photo first_name last_name")
      .populate("tipping_info");

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
    const response = new ApiResponse(
      User.find({
        $nor: [{ is_admin: true, _id: req.currentUser?.id }],
      }),
      req.query
    )
      .sort()
      .limitFields()
      .filter();

    const users = await response.paginate().query;
    res.status(200).json({
      status: "success",
      users,
      page: response.page_info,
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

    const token = await Token.findOne({ user: req.params.id, is_active: true, is_deleted: false })

    if (token) {
      await Token.findByIdAndUpdate(token.id, { is_active: false, is_deleted: true }, { new: true });
    }

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

/**
 * @openapi
 * /api/v1/users-only-funs-or-frens
 *   get:
 *     tags:
 *        - Auth
 *     description: List only fans and frens .
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a list of only fans or frens.
 */
router.get(
  "/api/v1/users-only-funs-or-frens",
  requireAuth,
  async (req: Request, res: Response) => {
    const frenForCurrentUser = await User.findById(
      req.currentUser?.id
    ).populate("friends", "_id");
    const fansForCurrentUser = await User.findById(
      req.currentUser?.id
    ).populate("funs", "_id");

    const mergeUserList =
      frenForCurrentUser && fansForCurrentUser
        ? [
          ...frenForCurrentUser.friends!.map((item: any) => item._id),
          ...fansForCurrentUser.funs!.map((item: any) => item._id),
        ]
        : [];

    const users = await User.find({
      _id: { $in: mergeUserList },
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
export { router as CurrentUserRoutes };
