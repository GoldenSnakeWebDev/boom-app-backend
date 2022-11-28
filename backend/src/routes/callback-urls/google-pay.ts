import { Request, Response, Router } from "express";

const router = Router();

router.post(
  "/api/callback-urls/google-playstore",
  async (req: Request, res: Response) => {
    console.log(req.body);

    res.status(200).json({ success: "success" });
  }
);

export { router as CallbackURLRoute };
