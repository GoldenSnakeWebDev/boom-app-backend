import mongoose from "mongoose";
import { server } from "./app";
import { config } from "./config";
import { updateStatuses } from "./schedular";
import { seed } from "./seeders/seeds";
import { sendGridSendMail } from "./utils/send-grid";

const start = async () => {
  const DB_URL = config.DB_URL! || `mongodb://localhost:27017/boom-dev`;

  // connect to DB

  await mongoose
    .connect(DB_URL)
    .then(() => console.log("Successfully connected to db"));

  await seed();
  updateStatuses();

  // to be removed sending email
  await sendGridSendMail({
    to: "devomambia@gmail.com",
    from: "omambiadauglous@gmail.com",
    subject: "Reset Password",
    text: "Reset Password",
    html: "<strong> You reset password code is: 45678 </strong>",
  });
  // end sending email
  const PORT = config.PORT || 4000;
  server.listen(PORT, () =>
    console.log(`App is running on http://localhost:${PORT}`)
  );
};

start();
