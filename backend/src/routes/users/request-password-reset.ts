import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";
import { User } from "./../../models/user";
import { BadRequestError } from "../../errors/bad-request-error";
import { randomCode } from "../../utils/common";

const router = Router();

router.post(
  "/api/v1/users/request-password-reset",
  [body("email").notEmpty().withMessage("Please provide email address")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      throw new BadRequestError(
        "User with supplied email does exist. Please try again later."
      );
    }

    // generate reset token
    const code = randomCode();

    // update user information

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        password_reset: { code, is_changed: true },
      },
      { new: true }
    );

    res.status(201).json({
      success: "success",
      user: updatedUser,
      message: `Successfully requested for password reset`,
    });
  }
);

export { router as UserRequestPasswordResetRoutes };
