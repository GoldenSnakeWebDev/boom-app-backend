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
  funs?: Array<any>;
  friends?: Array<any>;
  photo?: string;
  email: string;
  rebooms?: Array<any>;
  device_id?: string;
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

export interface IOnSignalData {
  included_segments: Array<string>;
  contents: {
    en: string;
    es: string;
  };
  name: string;
}
