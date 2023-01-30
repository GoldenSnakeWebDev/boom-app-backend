import { config } from "./../config";
import https from "https";
import { IOnSignalData } from "../types/user";

/**
 *
 */
export const onSignalSendNotification = async (data: IOnSignalData) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Basic ${config.PUSH_NOTIFICATION.ON_SIGNAL}`,
  };
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
