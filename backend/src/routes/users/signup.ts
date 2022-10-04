import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";
import { User } from "./../../models/user";
import { BadRequestError } from "../../errors/bad-request-error";

const router = Router();

router.post(
  "/api/v1/users/signup",
  [
    body("email").notEmpty().withMessage("Please provide email address"),
    body("password")
      .notEmpty()
      .withMessage("please provide your desired password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (user) {
      throw new BadRequestError(
        "You cannot proceed with the provided credentials. Please try again later."
      );
    }

    // perform other checks if possible

    // send sms

    // create user with password

    const newUser = new User({ email, password, is_active: true });

    await newUser.save();

    res.status(201).json({
      success: "success",
      user: newUser,
      message: `Successfully created your account`,
    });
  }
);

export { router as UserSignUpRoutes };
