export enum UserType {
  NORAMAL = "normal",
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  DEVELOPER = "developer",
}

export interface UserPayload {
  id?: string;
  first_name?: string;
  last_name?: string;
  booms?: Array<any>;
  followers?: Array<any>;
  following?: Array<any>;
  photo?: string;
  email: string;
  location?: string;
  bio?: string;
  username?: string;
  user_type?: string;
  is_active?: string;
  is_admin?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}
