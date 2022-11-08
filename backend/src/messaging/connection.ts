import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { io } from "./../app";
import { BoomBoxType } from "../models/boom-box";
import { createOrGetBoomBoxAndSendMessage } from "./boom-box-helper";

/**
 *  box?: string;
  content?: string;
  author: string;
  receiver: string;
  boomBoxType: BoomBoxType;
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
 */
interface WebsocketMessage {
  box?: string;
  author: string;
  receiver: string;
  content?: string;
}

io.on(
  "connection",
  (
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  ) => {
    console.log(`WORKING FOR ME:::${socket.id}`);

    socket.on("join_room", async (data: WebsocketMessage) => {
      const boomBox = await createOrGetBoomBoxAndSendMessage({
        ...data,
        socket,
        boomBoxType: BoomBoxType.PUBLIC,
      });
      socket.join(boomBox?.box!);
      console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    // send message
    socket.on("send_message", async (message: WebsocketMessage) => {
      await createOrGetBoomBoxAndSendMessage({
        ...message,
        socket,
        boomBoxType: BoomBoxType.PUBLIC,
      });
      console.log("Message", message);
      // socket.to(message.room).emit("receive_message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  }
);
