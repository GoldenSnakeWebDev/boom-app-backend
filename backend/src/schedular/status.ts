import cron from "node-cron";
import { Status } from "../models/status";

/**
 * Node Cron Running every minute to check if status is to be show or not
 */
export const updateStatuses = () => {
  try {
    cron.schedule("* * * * *", async () => {
      const statuses = await Status.find({ is_status: true });
      statuses.forEach((status) => {
        console.log(status.expiry_time!);
        const milliseconds = new Date(status.expiry_time!).getTime();
        const currentTimeInMilliseconds = Date.now();
        if (currentTimeInMilliseconds > milliseconds) {
          // if time > expiry_time
          // deactivate the statues and notify the all users
          Status.findByIdAndUpdate(
            status.id,
            { is_active: false },
            { new: true }
          )
            .then(() => {})
            .catch(() => console.log(`Error: Occurred while updating status`));
        }
      });
    });
  } catch (error) {
    console.log("Error", error);
  }
};
