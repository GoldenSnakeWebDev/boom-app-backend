import { app } from "./../app";
import {
  CurrentUserRoutes,
  UserUpdateProfileRoute,
  CurrentUserResetPasswordRoute,
  SignInRoutes,
  signOutRouter,
  UserSignUpRoutes,
  UserResetPasswordResetRoutes,
  UserRequestPasswordResetRoutes,
} from "./users";

import { BoomCreateUpdateRoutes } from "./booms/create-update-booms";
import { BoomListRoutes } from "./booms/list-booms";

app.use([
  UserResetPasswordResetRoutes,
  UserRequestPasswordResetRoutes,
  SignInRoutes,
  UserSignUpRoutes,
  signOutRouter,
  CurrentUserRoutes,
  UserUpdateProfileRoute,
  CurrentUserResetPasswordRoute,
]);

app.use([BoomListRoutes, BoomCreateUpdateRoutes]);
