import { Request, Response, Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import { User } from "../../models/user";
import { NotAuthorizedError } from "../../errors/not-authorized-error";

const router = Router();

router.get(
  "/api/v1/users/currentuser",
  requireAuth,
  async (req: Request, res: Response) => {
    console.log(req.currentUser);
    const user = await User.findById(req.currentUser?.id);

    if (!user) {
      throw new NotAuthorizedError();
    }
    res.status(200).json({
      status: "success",
      user,
    });
  }
);

export { router as CurrentUserRoutes };
