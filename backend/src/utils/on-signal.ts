// import https from "https";
import * as OneSignal from "@onesignal/node-onesignal";
import { config } from "./../config";
import { IOnSignalData } from "../types/user";

// export const onSignalSendNotification = async (data: IOnSignalData) => {
//   const headers = {
//     "Content-Type": "application/json; charset=utf-8",
//     Authorization: `Basic ${config.PUSH_NOTIFICATION.ON_SIGNAL_REST_API_KEY}`,
//     app_id: config.PUSH_NOTIFICATION.ON_SIGNAL_APP_ID,
//   };
//   console.log(headers);
//   const options = {
//     host: "onesignal.com",
//     port: 443,
//     path: "/api/v1/notifications",
//     method: "POST",
//     headers: headers,
//   };

//   const req = https.request(
//     options,
//     function (res: { on: (arg0: string, arg1: (data: any) => void) => void }) {
//       res.on("data", function (data) {
//         console.log("Response:");
//         console.log(JSON.parse(data));
//       });
//     }
//   );
//   req.on("error", function (e: any) {
//     console.log("ERROR:");
//     console.log(e);
//   });
//   req.write(JSON.stringify(data));
//   req.end();
// };

export const onSignalSendNotification = async (data: IOnSignalData) => {
  try {
    const configuration = OneSignal.createConfiguration({
      appKey: config.PUSH_NOTIFICATION.ON_SIGNAL_REST_API_KEY,
    });

    const client = new OneSignal.DefaultApi(configuration);

    const notification = new OneSignal.Notification();

    notification.app_id = config.PUSH_NOTIFICATION.ON_SIGNAL_APP_ID;
    notification.name = data.name;
    notification.included_segments = data.included_segments;
    notification.contents = data.contents;
    notification.headings = data.contents;
    await client.createNotification(notification);
  } catch (error) {
    console.log(error);
  }
};
