import { Request, Response, Router } from "express";

const router = Router();

/**
 * @openapi
 * /api/v1/networks:
 *   get:
 *     tags:
 *        - CallbackURLS
 *     description: List of networks available to for the boom platform.
 *     produces:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a  list of blockchain networks.
 */
router.post(
  "/api/callback-urls/google-playstore",
  async (req: Request, res: Response) => {
    console.log(req.body);

    res.status(200).json({ success: "success" });
  }
);

export { router as CallbackURLRoute };
