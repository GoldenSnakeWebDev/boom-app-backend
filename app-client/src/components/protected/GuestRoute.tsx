import type { FC } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getToken, getUser } from "../../store/local";

const GuestRoute: FC = () => {
  const token = getToken();
  const user = getUser();
  if (user && token) {
    return <Navigate to="/users/list" />;
  }
  return <Outlet />;
};

export default GuestRoute;
