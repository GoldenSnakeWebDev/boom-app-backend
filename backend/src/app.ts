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
import { WebSocket, RawData } from "ws";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const wss = new WebSocket.Server({ server });

// connection

// TO BE Moved

interface WebSocketType {
  box?: string;
  author: string;
  receiver: string;
  content?: string;
  command: string;
}

wss.on("connection", (ws: WebSocket, request: http.IncomingMessage) => {
  const clientIp = request.socket.remoteAddress;

  console.log(`[Websocket]  Client with IP ${clientIp}  has connected`);
  ws.send(JSON.stringify({}));

  // ws.onmessage = (e: RawData) => {
  //   console.log();
  //   // console.log(typeof JSON.parse(JSON.stringify(e.data)));
  // };

  ws.on("message", async (msg: RawData) => {
    // join Room
    let message: WebSocketType = JSON.parse(msg.toString());

    console.log("Message", message.author);

    if (message.command === "join_room") {
      const boomBox = await wsCreateOrGetBoomBoxAndSendMessage({
        ...message,
        boomBoxType: BoomBoxType.PUBLIC,
      });

      // console.log("Room Created", boomBox);
      wss.clients.forEach(async (client) => {
        if (client.readyState === WebSocket.OPEN) {
          // client.send(`Successfully joined ${boomBox?.label}`);

          const box = await BoomBox.findOne({
            box: boomBox?.box,
            box_type: "public",
          })
            .populate(
              "messages.author",
              "username photo first_name last_name _id"
            )
            .populate(
              "messages.receiver",
              "username photo first_name last_name _id"
            );
          client.send(JSON.stringify({ ...box?.toObject() }));
        }
      });
    }

    // if the user has sent a message
    if (message.command === "send_message") {
      const boomBox = await wsCreateOrGetBoomBoxAndSendMessage({
        ...message,
        boomBoxType: BoomBoxType.PUBLIC,
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ ...boomBox?.toObject() }));
        }
      });
    }

    // disconnect from the server

    console.log("Client has recieved the message", JSON.stringify(message));
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
import { BoomBox, BoomBoxType } from "./models/boom-box";

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
