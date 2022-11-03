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
import { SyncBankCurrentUserRoute } from "./sync-bank/current-user";
import { SyncBankCurrentUserDepositRoute } from "./sync-bank/deposit-withdraw";
import { ListTransactionsRoutes } from "./transactions/list";
import { HelperRoutes } from "./helper";
import { NetworksListRoutes } from "./networks";

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
app.use([SyncBankCurrentUserRoute]);
app.use([SyncBankCurrentUserDepositRoute]);
app.use([ListTransactionsRoutes]);
app.use([HelperRoutes]);
app.use([NetworksListRoutes]);
