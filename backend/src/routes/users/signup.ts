import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";
import { User } from "./../../models/user";
import { BadRequestError } from "../../errors/bad-request-error";

const router = Router();

/**
 * @openapi
 * /api/v1/users/signup:
 *   post:
 *     tags:
 *        - Auth
 *     description: Enables new users to create their account.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: email
 *          description: Email Address
 *        - name: username
 *          description: Username
 *        - name: password
 *          description: Password
 *     responses:
 *       200:
 *         description: . Successfully created your account. Please login
 */
router.post(
  "/api/v1/users/signup",
  [
    body("email").isEmail().withMessage("Please provide email address"),
    body("username").notEmpty().withMessage("Please provide your username"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
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
