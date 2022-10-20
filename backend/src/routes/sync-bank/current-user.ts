import { Response, Request, Router } from "express";
import { SyncBank } from "../../models/syncbank";
import { requireAuth } from "../../middlewares/require-auth";

const router = Router();

/**
 * @openapi
 * /api/v1/sync-bank/me:
 *   get:
 *     tags:
 *        - SyncBank
 *     description: Get the current logged user's sync bank.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a user's sync bank object.
 */
router.get(
  "/api/v1/sync-bank/me",
  requireAuth,
  async (req: Request, res: Response) => {
    const syncbank = await SyncBank.findOne({ user: req.currentUser?.id });

    res.status(200).json({
      status: "success",
      syncbank,
    });
  }
);

export { router as SyncBankCurrentUserRoute };
