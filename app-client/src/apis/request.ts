import axios from "axios";
import { getHeaders } from "../store/local";
import type { IUser, Product } from "../types/user";
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

export const burnUserAccount = async (id: string) => {
  console.log(endpoint.users.burnAccount(id));
  try {
    const { data } = await request.patch(`${endpoint.users.burnAccount(id)}`, {
      burn: true,
    });
    console.log(data);
  } catch (error) {
    console.log("Error", error);
  }
};

export const logoutUser = async () => {
  try {
    await request.post(endpoint.users.logout);
  } catch (error) {
    console.log("ERORR", error);
  }
};

export const getStripeProducts = async (): Promise<{
  products: Product[] | [];
  error?: string;
}> => {
  try {
    const { data } = await request.get(endpoint.products.stripe);
    return {
      error: "",
      products: data.products,
    };
  } catch (error) {
    console.log("Error", error);
    return {
      error: `Error: ${error}`,
      products: [],
    };
  }
};

export const createStripeProduct = async (opts: {
  name: string;
  description: string;
  price_in_units: number;
}): Promise<{
  product: Product | null;
  error?: string;
}> => {
  try {
    const { data } = await request.post(endpoint.products.stripe, {
      name: opts.name,
      description: opts.description,
      price_in_cents: opts.price_in_units,
    });

    window.location.reload();
    return { product: data.product, error: "" };
  } catch (error) {
    console.log("Error", error);
    return { error: `Error: ${error}`, product: null };
  }
};

export const updateStripeProduct = async (
  product: Product
): Promise<{
  product: Product | null;
  error?: string;
}> => {
  try {
    const { data } = await request.patch(
      `${endpoint.products.stripe}/${product.id}`,
      {
        ...product,
      }
    );

    window.location.reload();
    return { product: data.product, error: "" };
  } catch (error) {
    console.log("Error", error);
    return { error: `Error: ${error}`, product: null };
  }
};
