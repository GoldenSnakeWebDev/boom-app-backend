import { Request, Response, Router } from "express";
import { requireAuth } from "./../../middlewares";
import { User } from "./../../models/user";
import { NotAuthorizedError } from "../../errors/not-authorized-error";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";

const router = Router();

router.post(
  "/api/v1/users/update-profile",
  [body("email").isEmail().withMessage("please provide your email address")],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    const { email, username, first_name, last_name, bio, photo, location } =
      req.body;
    const user = await User.findById(req.currentUser?.id!);

    if (!user) {
      throw new NotAuthorizedError();
    }

    // update profile

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        email,
        username,
        first_name,
        last_name,
        bio,
        photo,
        location,
      },
      { new: true }
    );

    res.status(200).send({
      status: "success",
      message: "updated your profile",
      user: updatedUser,
    });
  }
);

export { router as UserUpdateProfileRoute };
