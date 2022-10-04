import mongoose from "mongoose";
import { app } from "./app";
import dotenv from "dotenv";

dotenv.config({ path: "./../.env" });

const start = async () => {
  if (process.env.JWT_KEY) {
    throw new Error("Please provide JWT_KEY in your .env file");
  }
  if (process.env.JWT_KEY) {
    throw new Error("Please provide DB_URL in your .env file");
  }

  const DB_URL = process.env.DB_URL! || `mongodb://localhost:27017/boom-dev`;

  // connect to DB

  await mongoose
    .connect(DB_URL)
    .then(() => console.log("Successfully connected to db"));

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`App is running on http://localhost:${PORT}`)
  );
};

start();
