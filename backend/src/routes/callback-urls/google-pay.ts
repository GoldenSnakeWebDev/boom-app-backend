import { Request, Response, Router } from "express";

const router = Router();

/**
 * @openapi
 * /api/v1/callback-urls/google-plays-tore:
 *   post:
 *     tags:
 *        - CallbackUrl
 *     description: Callback URL to access Google plays tore request and response.
 *     produces:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns a success message
 */
router.post(
  "/api/v1/callback-urls/google-plays-tore",
  async (req: Request, res: Response) => {
    console.log(req.body);

    res.status(200).json({ success: "success" });
  }
);

export { router as CallbackURLRoute };
