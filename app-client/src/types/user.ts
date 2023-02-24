/* eslint-disable @typescript-eslint/array-type */
export interface UserType {
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

export interface IUser {
  id?: string;
  first_name?: string;
  last_name?: string;
  booms?: Array<any>;
  blocked_users?: Array<any>;
  rebooms?: Array<any>;
  friends?: Array<any>;
  funs?: Array<any>;
  sync_bank?: any;
  device_id?: string;
  photo?: string;
  cover?: string;
  email: string;
  location?: string;
  phone?: string;
  password_reset?: {
    is_changed?: boolean;
    token?: string;
  };
  password_reset_token?: string;
  is_admin?: boolean;
  bio?: string;
  username?: string;
  password: string;
  user_type?: string;
  is_active?: string;
  social_media?: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    telegram?: string;
    discord?: string;
    medium?: string;
  };
}
