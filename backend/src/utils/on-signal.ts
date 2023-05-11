import https from "https";
import { config } from "./../config";
import { IOnSignalData } from "../types/user";

export const onSignalSendNotification = async (data: IOnSignalData) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Basic ${config.PUSH_NOTIFICATION.ON_SIGNAL_REST_API_KEY}`,
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
      res.on("data", function () {
        // console.log(JSON.parse(resData));
      });
    }
  );
  req.on("error", function (e: any) {
    console.log("ERROR:");
    console.log(e);
  });

  req.write(
    JSON.stringify({
      app_id: config.PUSH_NOTIFICATION.ON_SIGNAL_APP_ID,
      name: data.name,
      included_segments: ["Subscribed Users"],
      contents: data.contents,
      include_external_user_ids: data.include_external_user_id,
      channel_for_external_user_ids: "push",
      headings: { en: data.name },
    })
  );
  req.end();
};
