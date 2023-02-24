import type { FC } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getToken, getUser } from "../../store/local";

const RequireAuth: FC = () => {
  const token = getToken();
  const user = getUser();
  if (!user || !token) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
};

export default RequireAuth;
