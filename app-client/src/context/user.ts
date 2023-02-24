/* eslint-disable @typescript-eslint/consistent-type-imports */
import { createContext } from "react";
import { UserType } from "../types/user";

interface UserContextType {
  token?: string;
  user?: UserType;
  setToken: any;
  setUser: any;
}
export const UserContext = createContext<UserContextType>({
  token: "",
  user: undefined,
  setToken: () => {},
  setUser: () => {},
});
