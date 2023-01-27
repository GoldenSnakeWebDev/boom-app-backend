import SendGrid from "@sendgrid/mail";
import { config } from "../config";

SendGrid.setApiKey(config.MAIL.SEND_GRID);

export const sendGridSendMail = async (opts: {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
}) => {
  try {
    const msg = await SendGrid.send({ ...opts });
    console.log(msg);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};
