import { Request, Response, Router } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest } from "../../middlewares/validate-request";
import { User } from "./../../models/user";
import { BadRequestError } from "../../errors/bad-request-error";
import { PasswordManager } from "../../utils/password-manager";

const router = Router();

router.post(
  "/api/v1/users/signin",
  [
    body("email").notEmpty().withMessage("please provide email address"),
    body("password").notEmpty().withMessage("please provide your password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError(`Wrong credentials. Please try again`);
    }

    const passwordExists = await PasswordManager.compare(
      user.password,
      password
    );

    if (!passwordExists) {
      throw new BadRequestError(`Wrong credentials. Please try again`);
    }

    // generate token

    const token = await jwt.sign(
      {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        photo: user.photo,
      },
      process.env.JWT_KEY!
    );

    // allow cookie session

    req.session = {
      jwt: token,
    };

    res.status(200).json({
      status: "success",
      user,
      cookie: req.session?.jwt,
      message: `Sucessfully signed in to your account`,
    });
  }
);

export { router as SignInRoutes };
