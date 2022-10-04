import express from "express";
import { requireAuth } from "./../../middlewares";

const router = express.Router();

router.post("/api/v1/users/signout", requireAuth, (req, res) => {
  req.currentUser = undefined;

  res.status(200).send({ status: "success", message: "Welcome Back!!" });
});

export { router as signOutRouter };
