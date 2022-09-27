import { Request, Response, Router } from "express";

const router = Router();

router.get(
  "/api/v1/users/current-user",
  async (_req: Request, res: Response) => {
    res.status(200).json({
      status: "success",
      user: { name: "Omambia" },
    });
  }
);

export { router as CurrentUserRoutes };
