import express, { Request, Response } from "express";
import { Token } from "../../models/token";
import { requireAuth } from "./../../middlewares";

const router = express.Router();

/**
 * @openapi
 * /api/v1/users/signout:
 *   post:
 *     tags:
 *        - Auth
 *     description: Enables user to log out of his/her account.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: . Successfully logged our from  your account.
 */
router.post("/api/v1/users/signout", requireAuth, async (req: Request, res: Response) => {

  const token = await Token.findOne({ user: req.currentUser?.id!, is_active: true });


  if (token) {
    await Token.findByIdAndUpdate(token.id, { is_active: false, is_deleted: true }, { new: true });
  }
  req.currentUser = undefined;

  res.status(200).send({ status: "success", message: "Welcome Back!!" });
});

export { router as signOutRouter };
