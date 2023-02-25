import type { FC } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getToken, getUser } from "../../store/local";

const RequireAuth: FC = () => {
  const token = getToken();
  const user = getUser();
  console.log(token, user);
  if (!user || !token) {
    return <Navigate to="/auth/sign-in" />;
  }
  return <Outlet />;
};

export default RequireAuth;
