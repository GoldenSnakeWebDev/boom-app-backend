import https from "https";
import { config } from "./../config";
import { IOnSignalData } from "../types/user";

export const onSignalSendNotification = async (data: IOnSignalData) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Basic ${config.PUSH_NOTIFICATION.ON_SIGNAL_REST_API_KEY}`,
    app_id: config.PUSH_NOTIFICATION.ON_SIGNAL_APP_ID,
  };
  console.log(headers);
  const options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers,
  };

  const req = https.request(
    options,
    function (res: { on: (arg0: string, arg1: (data: any) => void) => void }) {
      res.on("data", function (data) {
        console.log("Response:");
        console.log(JSON.parse(data));
      });
    }
  );
  req.on("error", function (e: any) {
    console.log("ERROR:");
    console.log(e);
  });
  req.write(JSON.stringify(data));
  req.end();
};

// export const onSignalSendNotification = async (data: IOnSignalData) => {
//   const sdk = OneSignal(
//     config.PUSH_NOTIFICATION.ON_SIGNAL_REST_API_KEY,
//     config.PUSH_NOTIFICATION.ON_SIGNAL_APP_ID,
//     true
//   );

//   console.log(data.contents);
//   await sdk
//     .createNotification(
//       {
//         included_segments: data.included_segments,
//         contents: {
//           en: data.contents.en?.toString(),
//           es: data.contents.es?.toString(),
//         },
//         name: data.name.toString(),
//       },
//       {
//         authorization: `Basic ${config.PUSH_NOTIFICATION.ON_SIGNAL_REST_API_KEY}`,
//       }
//     )
//     .then((res: any) => console.log(res));
//   // .catch((err: any) => console.error(err));
// };
