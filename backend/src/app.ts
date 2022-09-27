import express, { json } from "express";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import "express-async-errors";
import cookieSession from "cookie-session";
import { NotFoundError } from "./errors";
import { errorHandler } from "./middlewares";

const app = express();

// MIDDLEWARE
app.set("trust proxy", false);
app.use(express.json());
app.use(json());
app.use(cors());

app.use(json({ limit: "350mb" }));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
    // maxAge: 24 * 60 * 60 * 1000
  })
);

/**log ... ERROR api endpoints*/
app.use(morgan("dev"));

// ROUTES
app.use("/api/v1/users/", express.static(path.join(__dirname, "public")));

import "./routes/index";

// Not found Route
app.all("*", async (_req, _res) => {
  throw new NotFoundError();
});

// ERROR HANDLING
app.use(errorHandler);

export { app };
