import { Router, Response, Request } from "express";
import { ApiResponse } from "../../utils/api-response";
import { Boom, BoomState, BoomType, User } from "../../models";
import { requireAuth } from "../../middlewares";

const router = Router();

/**
 * @openapi
 * /api/v1/booms-types:
 *   get:
 *     tags:
 *        - Booms
 *     description: List of all boom types  available to for the boom platform.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of boom types.
 */
router.get("/api/v1/booms-types", async (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "success", boom_types: Object.values(BoomType) });
});


router.get("/api/v1/booms-states", async (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "success", boom_states: Object.values(BoomState) });
});



/**
 * @openapi
 * /api/v1/booms:
 *   get:
 *     tags:
 *        - Booms
 *     description: List of all platform booms.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of booms.
 */
router.get(
  "/api/v1/booms",

  async (req: Request, res: Response) => {
    /**
     * Only fetch booms for unblocked users
     */

    const blockedUsers = await User.findById(req.currentUser?.id).populate(
      "blocked_users",
      "_id"
    );
    console.log(blockedUsers);

    const response = new ApiResponse(
      // Boom.find()
      Boom.find({ is_deleted: false })
        .populate({ path: "comments", options: { _recursed: true } })
        .populate("network")
        .populate("reactions.likes", "username photo first_name last_name")
        .populate("reactions.loves", "username photo first_name last_name")
        .populate("reactions.smiles", "username photo first_name last_name")
        .populate("reactions.rebooms", "username photo first_name last_name")
        .populate("reactions.reports", "username photo first_name last_name")
        .populate("user", "username photo first_name last_name")
        .populate("comments")
        .populate("comments.user", "username photo first_name last_name"),
      req.query
    )
      .filter()
      .sort()
      .limitFields();

    // const count = await response.query;

    const booms = await response.paginate().query;

    res.status(200).json({
      status: "success",
      page: response?.page_info,
      // count: count.length,
      booms,
    });
  }
);

/**
 * @openapi
 * /api/v1/booms/only-auth:
 *   get:
 *     tags:
 *        - Booms
 *     description: List of all platform booms.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of booms.
 */
router.get(
  "/api/v1/booms/only-auth",
  requireAuth,
  async (req: Request, res: Response) => {
    const blockedUsers = await User.findById(req.currentUser?.id).populate(
      "blocked_users",
      "_id"
    );
    const response = new ApiResponse(
      // Boom.find()
      Boom.find({
        is_deleted: false,
        user: {
          $nin: blockedUsers?.blocked_users!.map((user: any) => user._id),
        },
      })
        .populate({ path: "comments", options: { _recursed: true } })
        .populate("network")
        .populate("reactions.likes", "username photo first_name last_name")
        .populate("reactions.loves", "username photo first_name last_name")
        .populate("reactions.smiles", "username photo first_name last_name")
        .populate("reactions.rebooms", "username photo first_name last_name")
        .populate("reactions.reports", "username photo first_name last_name")
        .populate("user", "username photo first_name last_name")
        .populate("comments")
        .populate("comments.user", "username photo first_name last_name"),
      req.query
    )
      .filter()
      .sort()
      .limitFields();

    // const count = await response.query;

    const booms = await response.paginate().query;

    res.status(200).json({
      status: "success",
      page: response?.page_info,
      // count: count.length,
      booms,
    });
  }
);

/**
 * @openapi
 * /api/v1/fetch-user-booms/:id:
 *   get:
 *     tags:
 *        - Booms
 *     description: List of all platform booms.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of booms.
 */
router.get(
  "/api/v1/fetch-user-booms/:userId",
  async (req: Request, res: Response) => {
    const response = new ApiResponse(
      Boom.find({ user: req.params.userId })
        .populate({ path: "comments", options: { _recursed: true } })
        .populate("network")
        .populate("reactions.likes", "username photo first_name last_name")
        .populate("reactions.loves", "username photo first_name last_name")
        .populate("reactions.smiles", "username photo first_name last_name")
        .populate("reactions.rebooms", "username photo first_name last_name")
        .populate("reactions.reports", "username photo first_name last_name")
        .populate("user", "username photo first_name last_name")
        .populate("comments")
        .populate("comments.user", "username photo first_name last_name"),
      req.query
    )
      .filter()
      .sort()
      .limitFields();

    // const count = await response.query;

    const booms = await response.paginate().query;

    res.status(200).json({
      status: "success",
      page: response?.page_info,
      // count: count.length,
      booms,
    });
  }
);

/**
 * @openapi
 * /api/v1/booms/mine:
 *   get:
 *     tags:
 *        - Booms
 *     description: List of all  user  platform booms.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of booms.
 */
router.get(
  "/api/v1/booms/mine",
  requireAuth,
  async (req: Request, res: Response) => {
    const response = new ApiResponse(
      Boom.find({ user: req.currentUser?.id, is_deleted: false })
        .populate("network")
        .populate("reactions.likes", "username photo first_name last_name")
        .populate("reactions.loves", "username photo first_name last_name")
        .populate("reactions.smiles", "username photo first_name last_name")
        .populate("reactions.rebooms", "username photo first_name last_name")
        .populate("reactions.reports", "username photo first_name last_name")
        .populate("user", "username photo first_name last_name")
        .populate("comments")
        .populate("comments.user", "username photo first_name last_name"),
      req.query
    )
      .filter()
      .sort()
      .limitFields();

    // const count = await response.query;

    const booms = await response.paginate().query;

    res.status(200).json({
      status: "success",
      page: response?.page_info,
      // count: count.length,
      booms,
    });
  }
);

/**
 * @openapi
 * /api/v1/booms/:id:
 *   get:
 *     tags:
 *        - Booms
 *     description: Get details of a single boom.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns an object of a single boom.
 */
router.get("/api/v1/booms/:id", async (req: Request, res: Response) => {
  const boom = await Boom.findById(req.params.id)
    .populate("network")
    .populate("reactions.likes", "username photo first_name last_name")
    .populate("reactions.loves", "username photo first_name last_name")
    .populate("reactions.smiles", "username photo first_name last_name")
    .populate("reactions.rebooms", "username photo first_name last_name")
    .populate("reactions.reports", "username photo first_name last_name")
    .populate("user", "username photo first_name last_name")
    .populate("comments")
    .populate("comments.user", "username photo first_name last_name");
  res.status(200).json({ status: "success", boom });
});

export { router as BoomListRoutes };
