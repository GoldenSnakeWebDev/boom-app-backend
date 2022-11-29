import express, { json } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import "express-async-errors";
import cookieSession from "cookie-session";
import SwaggerJSDoc from "swagger-jsdoc";
import SwaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./docs/options";
import { NotFoundError } from "./errors";
import { errorHandler } from "./middlewares";
import { WebSocket } from "ws";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const wss = new WebSocket.Server({ server });

// connection

// TO BE Moved

// interface WebSocketType {
//   box?: string;
//   author: string;
//   receiver: string;
//   content?: string;
//   command: string;
// }

wss.on("connection", (ws: WebSocket, request: http.IncomingMessage) => {
  const clientIp = request.socket.remoteAddress;

  console.log(`[Websocket]  Client with IP ${clientIp}  has connected`);
  ws.send("Thanks for connect to server");

  ws.on("message", async (message: any) => {
    // join Room

    console.log(message.toString());

    if (message.command === "join_room") {
      const boomBox = await wsCreateOrGetBoomBoxAndSendMessage({
        ...message,
        boomBoxType: BoomBoxType.PUBLIC,
      });

      console.log("Room Created", boomBox);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`Successfully joined ${boomBox?.label}`);
        }
      });
    }

    // if the user has sent a message
    if (message.command === "send_message") {
      const boomBox = await wsCreateOrGetBoomBoxAndSendMessage({
        ...message,
        boomBoxType: BoomBoxType.PUBLIC,
      });

      console.log("Room Created", boomBox);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    }

    wss.clients.forEach((client) => {
      client.emit("recieve_message", (msg: any) => {
        console.log("Message", msg);
      });
      client.send(message);
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });

    // disconnect from the server

    console.log("Client has recieved the message", message.toString());
  });
});

wss.on("close", () => {
  console.log("Connection Lost");
});

import "./messaging/connection";

// MIDDLEWARE
app.set("trust proxy", false);
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(json());
app.use(cors());

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/emails"));

app.use(json({ limit: "350mb" }));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
    maxAge: 24 * 60 * 60 * 1000,
  })
);

/**log ... ERROR api endpoints*/
app.use(morgan("dev"));

// ROUTES
app.use("/api/v1/users/", express.static(path.join(__dirname, "public")));

import "./routes/index";
import { wsCreateOrGetBoomBoxAndSendMessage } from "./messaging/boom-box-helper";
import { BoomBoxType } from "./models/boom-box";

//API DOCScon
app.use(
  "/api-docs",
  SwaggerUi.serve,
  SwaggerUi.setup(SwaggerJSDoc(swaggerOptions), {
    explorer: true,
    customSiteTitle: "Boom App",
  })
);

// Not found Route
app.all("*", async (_req, _res) => {
  throw new NotFoundError();
});

// ERROR HANDLING
app.use(errorHandler);

export { app, io, server };
