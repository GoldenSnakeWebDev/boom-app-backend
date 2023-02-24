import axios from "axios";
import { getHeaders } from "../store/local";
import type { IUser } from "../types/user";
import endpoint from "./endpoint";
//  Base URL
const BASE_URL = "http://localhost:4000/api/v1/";

/**
 * Request
 */
export const request = axios.create({
  baseURL: `${BASE_URL}`,
  headers: getHeaders(),
});

/**
 * LOGIN
 */

export const loginUser = async (email: string, password: string) => {
  try {
    const { data } = await request.post(endpoint.users.signIn, {
      email,
      password,
      deviceId: "admin34567898765432345678",
    });

    return {
      cookie: data.cookie,
      message: data.message,
      status: data.status,
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    console.log("Error");
    return {
      error: error,
    };
  }
};

export const getUsers = async (): Promise<IUser[] | []> => {
  try {
    const { data } = await request.get(endpoint.users.users);
    return data.users as IUser[];
  } catch (error) {
    console.log("Error", error);
    return [];
  }
};
