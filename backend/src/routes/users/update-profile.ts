import { Request, Response, Router } from "express";
import { requireAuth } from "./../../middlewares";
import { User } from "./../../models/user";
import { NotAuthorizedError } from "../../errors/not-authorized-error";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";

const router = Router();

/**
 * @openapi
 * /api/v1/users/update-profile:
 *   patch:
 *     tags:
 *        - Auth
 *     description: Enables new users to update  their account.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: email
 *          description: Email Address
 *        - name: first_name
 *          description: User first name
 *        - name: last_name
 *          description: User last name
 *        - name: first_name
 *          description: User first name
 *        - name: username
 *          description: User username
 *        - name: photo
 *          description: User photo
 *        - name: bio
 *          description: User biography
 *        - name: location
 *          description: User location
 *     responses:
 *       200:
 *         description: . Successfully updated your account.
 */
router.post(
  "/api/v1/users/update-profile",
  [body("email").isEmail().withMessage("please provide your email address")],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    const {
      email,
      username,
      first_name,
      last_name,
      bio,
      photo,
      location,
      cover,
    } = req.body;
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
        cover,
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
