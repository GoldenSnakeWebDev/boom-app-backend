import { Router, Request, Response } from "express";
import { User } from "../../models/user";
import { ApiResponse } from "../../utils/api-response";
import { Boom } from "../../models/boom";

const router = Router();

/**
 * @openapi
 * /api/v1/searching:
 *   get:
 *     tags:
 *        - Searching
 *     description: List all search items.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Booms list all epics epic/tales
 */

router.get("/api/v1/searching", async (req: Request, res: Response) => {
  const searchQuery = req.query.search?.toString();

  const userProfile = await User.findOne({
    $or: [
      { username: new RegExp(`${searchQuery}`, "i") },
    ],
  });

  const response = new ApiResponse(
    Boom.find({
      $or: [
        { user: userProfile?.id },
        { title: new RegExp(`${searchQuery}`, "i") },
        { description: new RegExp(`${searchQuery}`, "i") },
        { location: new RegExp(`${searchQuery}`, "i") },
      ],
    })
      .populate({ path: "comments", options: { _recursed: true } })
      .populate("network")
      .populate("reactions.likes")
      .populate("reactions.loves")
      .populate("reactions.smiles")
      .populate("reactions.rebooms")
      .populate("reactions.reports")
      .populate("user")
      .populate("comments")
      .populate("comments.user"),
    req.query
  )
    .filter()
    .sort()
    .limitFields();
  // const count = await response.query;
  const booms = await response.paginate().query;

  const accounts  =  await User.find({"_id": {"$in": booms.map((boom: any) => boom.user.id)}})
  .populate("sync_bank")
  .populate("friends", "username photo first_name last_name")
  .populate("funs", "username photo first_name last_name");

  res.status(200).json({
    status: "success",
    page: response?.page_info,
    // count: count.length,
    search: {
      booms,
      accounts
    }
  });
});

export { router as BoomSearchRoutes };
