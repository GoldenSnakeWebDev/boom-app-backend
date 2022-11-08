import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { BoomBox, BoomBoxType } from "../models/boom-box";
import { User } from "../models/user";

/**
 * Create a new boomBox, either public or private
 * @param message
 * @returns
 */
export const createOrGetBoomBoxAndSendMessage = async (message: {
  box?: string;
  content?: string;
  author: string;
  receiver: string;
  boomBoxType: BoomBoxType;
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
}) => {
  let boomBox = await BoomBox.findOne({ box: message.box });

  if (boomBox) {
    // save message
    const builMessage = {
      content: message?.content!,
      author: message.author,
      receiver: message.receiver,
      is_delete: false,
      timestamp: Date.now(),
    };

    boomBox = await BoomBox.findByIdAndUpdate(
      boomBox.id,
      { ...builMessage },
      { new: true }
    );

    message.socket.to(message.box!).emit("receive_message", {
      content: message?.content!,
      author: await User.findById(message.author).populate("sync_bank"),
      receiver: await User.findById(message.receiver).populate("sync_bank"),
      is_delete: false,
      timestamp: Date.now(),
    });

    return boomBox;
  }

  // create boom box and

  boomBox = new BoomBox({
    box: `${message.author}:${message.receiver}`,
    box_type: message.boomBoxType,
    author: message.author,
    receiver: message.receiver,
  });

  return boomBox;
};
