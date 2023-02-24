export const USER = "user";
export const TOKEN = "token";

/**
 * Get the user stored in the localstorage
 * @returns any | null
 */
export const getUser = (): any | null => {
  const user = localStorage.getItem(USER);
  return user ? JSON.parse(user) : null;
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN) ? localStorage.getItem(TOKEN) : "";
};

/**
 * SETTERS
 */

export const setToken = (_token: string): void => {
  localStorage.setItem(TOKEN, _token);
};

export const setUser = (_user: any): void => {
  localStorage.setItem(USER, JSON.stringify(_user));
};

/**
 *
 * @returns Get Headers
 */
export const getHeaders = () => {
  const token = getToken();

  return {
    Authorization: `Bearer ${token}`,
  };
};
