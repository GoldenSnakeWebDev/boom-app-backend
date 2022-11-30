import { Router, Response, Request } from "express";

const router = Router();

/**
 * @openapi
 * /api/v1/blocl-user:
 *   get:
 *     tags:
 *        - BoomBox
 *     description: List of all boom Box Type
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of boom types.
 */
router.get("/api/v1/boom-box-types", async (_req: Request, res: Response) => {
  res.status(200).json({ status: "success" });
});
