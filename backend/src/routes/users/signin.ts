import { Request, Response, Router } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest } from "../../middlewares/validate-request";
import { User } from "./../../models/user";
import { Token } from './../../models/token';
import { BadRequestError } from "../../errors/bad-request-error";
import { PasswordManager } from "../../utils/password-manager";
import { config } from "./../../config";

const router = Router();

/**
 * @openapi
 * /api/v1/users/signin:
 *   post:
 *     tags:
 *        - Auth
 *     description: Enables user to be authenticated and authorized.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: email
 *          description: Email Address
 *        - name: password
 *          description: Password
 *  *     - name: deviceId
 *          description: Device ID
 *     responses:
 *       200:
 *         description: . Successfully logged in to your account.
 */
router.post(
  "/api/v1/users/signin",
  [
    body("email")
      .notEmpty()
      .withMessage("please provide email address  or username"),
    // body("deviceId").notEmpty().withMessage("please provide the device id"),
    body("password").notEmpty().withMessage("please provide your password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // const { email, password, deviceId } = req.body;
    const { email, password} = req.body;

    console.log("secret key>>>>",email);
    
    const user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(email, "i") } },
        { username: { $regex: `!${email}`, $options: 'i' } }
      ]
    })
      .populate("sync_bank")
      .populate("funs")
      .populate("friends", "username photo first_name last_name")
      .populate("funs", "username photo first_name last_name");

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

    if (!user.is_active) {
      throw new BadRequestError("Your account has been burned");
    }

    // update device id

    // if (user.device_id !== deviceId) {
    //   user.device_id = deviceId;
    //   // save the device id
    //   await user.save();
    // }
    // generate token
    console.log("saved secret key>>>.", config.JWT_KEY);
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        photo: user.photo,
        device_id: user.device_id,
        is_admin: user.is_admin,
      },
      config.JWT_KEY
    );


    // create token

    await Token.create({ token, user: user.id });
    req.session = {
      jwt: token,
    };

    res.status(200).json({
      status: "success",
      user,
      token: token,
      cookie: req.session?.jwt,
      message: `Sucessfully signed in to your account`,
    });
  }
);

export { router as SignInRoutes };
