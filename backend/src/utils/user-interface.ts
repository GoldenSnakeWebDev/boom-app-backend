import express from "express";
import { UserType } from "../types/user-account";
interface UserPayload {
  id: string;
  name?: string;
  phone: string;
  user_type?: UserType;
  is_superadmin?: boolean;
  photo?: string;
  email?: string;
  activation_code?: string;
  is_active?: boolean;
}

// adding argumented type defination. Adding new properties
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
      userId?: string;
    }
  }
}

export { UserPayload };
