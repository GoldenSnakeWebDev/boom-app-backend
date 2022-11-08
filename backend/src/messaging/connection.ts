import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { io } from "./../app";

io.on(
  "connection",
  (
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  ) => {
    console.log(`WORKING FOR ME::::::::::::::::: ${socket.id}`);

    socket.on("join_room", (data) => {
      socket.join(data);
      console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    // send message
    socket.on("send_message", (message) => {
      console.log("Message", message);
      socket.to(message.room).emit("receive_message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  }
);
