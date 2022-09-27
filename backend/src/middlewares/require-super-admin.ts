import { Request, Response, NextFunction } from "express";
import { NotAuthorizedError } from "../errors/not-authorized-error";
import { UserType } from "./../types/user";

export const requireSuperAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (
    (!req.currentUser?.is_superadmin &&
      req.currentUser?.user_type !== UserType.SUPERADMIN) ||
    (!req.currentUser?.is_superadmin &&
      req.currentUser?.user_type !== UserType.ADMIN)
  ) {
    throw new NotAuthorizedError();
  }
  next();
};
