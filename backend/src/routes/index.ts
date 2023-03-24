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
import { CommentRoutes } from "./booms/comment";
import { EpicTaleRoutes } from "./status/index";
import { BoomBoxRoutes } from "./boom-box";
import { NotificationRoutes } from "./notification/index";
import { FriendsFollowersRoutes } from "./users/friends";
import { TezosMintAndURLPrep } from "./tezos";
import { TippingRoute } from "./sync-bank/tipping";
import { BoomSearchRoutes } from "./searching/index";
import { CallbackURLRoute } from "./callback-urls/google-pay";
import { BlockUserRoutes } from "./users/block";
import { StripePaymentRoutes } from "./stripe";
import { PayPalRoutes } from "./paypal";
import { TransferSyncRoute } from "./sync-bank/transfer";

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
app.use([CommentRoutes]);
app.use([EpicTaleRoutes]);
app.use([BoomBoxRoutes]);
app.use([NotificationRoutes]);
app.use([FriendsFollowersRoutes]);
app.use([TezosMintAndURLPrep]);
app.use([TippingRoute]);
app.use([BoomSearchRoutes]);
app.use([CallbackURLRoute]);
app.use([BlockUserRoutes]);
app.use([StripePaymentRoutes]);
app.use([PayPalRoutes]);
app.use([TransferSyncRoute]);
