import cron from "node-cron";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { io } from "./../app";
import { Status } from "./../models/status";

/**
 * Node Cron Running every minute to check if status is to be show or not
 */
export const updateStatuses = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Updating Tales & Epics");

    const statuses = await Status.find({ is_active: true });

    statuses.forEach(async (status) => {
      // check if the current time if equal to provided time

      //expiryTimeInMiliseconds
      const expiryTimeInMiliseconds = new Date(
        status.expiry_time!
      ).getMilliseconds();
      const currentTimeInMillseconds = Date.now();

      if (currentTimeInMillseconds > expiryTimeInMiliseconds) {
        // if time > expiry_time
        // deactivate the statues and notify the all users

        await Status.findByIdAndUpdate(
          status.id,
          { is_active: false },
          { new: true }
        );
        io.on(
          "connection",
          async (
            socket: Socket<
              DefaultEventsMap,
              DefaultEventsMap,
              DefaultEventsMap,
              any
            >
          ) => {
            const newStatues = await Status.find({ is_active: true });
            socket.emit("removed_epic", newStatues);
          }
        );
      }
    });
  });
};
