import cron from "node-cron";
import {Status} from "../models/status";

/**
 * Node Cron Running every minute to check if status is to be show or not
 */
export const updateStatuses = () => {
    cron.schedule("* * * * *", async () => {
        console.log("Checks for statues update");

        const statuses = await Status.find({is_active: true});
        statuses.forEach((status) => {

            const milliseconds = new Date(
                status.expiry_time!
            ).getMilliseconds();
            const currentTimeInMilliseconds = Date.now();

            console.log("Statues: compare now & future_time ", currentTimeInMilliseconds, milliseconds);

            if (currentTimeInMilliseconds > milliseconds) {
                // if time > expiry_time
                // deactivate the statues and notify the all users

                Status.findByIdAndUpdate(
                    status.id,
                    {is_active: false},
                    {new: true}
                )
                    .then(() => {})
                    .catch(() => console.log(`Error: Occurred while updating status`));
            }
        });
    });
};
