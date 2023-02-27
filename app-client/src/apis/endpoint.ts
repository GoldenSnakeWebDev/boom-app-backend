export default {
  users: {
    signIn: `users/signin`,
    signUp: `users/signup`,
    currentUser: `users/currentuser`,
    requestPasswordReset: `users/request-password-reset`,
    passwordReset: `users/reset-password`,
    userResetPassword: `users/currentuser`,
    users: `users-list`,
    logout: `users/signout`,
    burnAccount: (id: string) => `users/burn-admin-account/${id}`,
    processStripe: `stripe/checkout`,
  },

  products: {
    stripe: `stripe/products`,
  },
};
