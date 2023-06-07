import mongoose from "mongoose";
import { server } from "./app";
import { config } from "./config";
import { updateStatuses } from "./schedular";
import { seed } from "./seeders/seeds";
// import { passwordResetTemplate } from "./templates/password-reset";
// import { sendGridSendMail } from "./utils/send-grid";
// import { crossChainMint } from "./utils/cross-mint";

const start = async () => {
  const DB_URL = config.DB_URL! || `mongodb://127.0.0.1:27017/boom-dev`;

  // connect to DB
  mongoose.set("strictQuery", false);
  await mongoose
    .connect(DB_URL)
    .then(() => console.log("Successfully connected to db"));
  await seed();
  updateStatuses();

  const PORT = config.PORT || 4000;
  server.listen(PORT, () =>
    console.log(`App is running on http://localhost:${PORT}`)
  );
};

start();
