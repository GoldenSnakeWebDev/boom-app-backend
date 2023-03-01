import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import theme from "./flowbite-theme";
import { Flowbite } from "flowbite-react";
import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import DashboardPage from "./pages";
import SignInPage from "./pages/authentication/sign-in";
import SignUpPage from "./pages/authentication/sign-up";
import UserListPage from "./pages/users/list";
import { UserContext } from "./context/user";
import type { UserType } from "./types/user";
import RequireAuth from "./components/protected/RequireAuth";
import GuestRoute from "./components/protected/GuestRoute";
import { getToken, getUser } from "./store/local";
import ProductListPage from "./pages/products";

const container = document.getElementById("root");

if (!container) {
  throw new Error("React root element doesn't exist!");
}

const root = createRoot(container);

const App = () => {
  const [user, setUser] = useState<UserType>({
    id: "",
    first_name: "",
    last_name: "",
    booms: [],
    funs: [],
    friends: [],
    photo: "",
    email: "",
    rebooms: [],
    device_id: "",
    location: "",
    bio: "",
    username: "",
    user_type: "",
    is_active: "",
    is_admin: false,
  });

  const [token, setToken] = useState<any>("");

  useEffect(() => {
    setToken(getToken());
    setUser(getUser());
  }, []);

  return (
    <UserContext.Provider value={{ setToken, setUser, token, user: user }}>
      <Flowbite theme={{ theme }}>
        <BrowserRouter>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route path="/" element={<ProductListPage />} index />
              <Route path="/users/list" element={<UserListPage />} />
              <Route path="/products" element={<ProductListPage />} />
            </Route>
            <Route element={<GuestRoute />}>
              <Route path="/auth/sign-in" element={<SignInPage />} />
              <Route path="/auth/reset-password" element={<SignInPage />} />
              <Route
                path="/auth/request-password-reset"
                element={<SignUpPage />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </Flowbite>
    </UserContext.Provider>
  );
};

// Render the application
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
