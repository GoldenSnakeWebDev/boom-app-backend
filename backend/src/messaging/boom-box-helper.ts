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
  const receiver = await User.findById(message.receiver).populate("sync_bank");

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
    box: `${message.author}:${Date.now()}`,
    label: receiver?.username
      ? `${receiver?.username}`
      : `${receiver?.first_name!} ${receiver?.last_name!}`,
    box_type: message.boomBoxType,
    author: message.author,
    receiver: message.receiver,
  });

  return boomBox;
};

export const wsCreateOrGetBoomBoxAndSendMessage = async (message: {
  box?: string;
  content?: string;
  author: string;
  receiver: string;
  boomBoxType: BoomBoxType;
}) => {
  let boomBox = await BoomBox.findOne({ box: message.box });
  const receiver = await User.findById(message.receiver).populate("sync_bank");

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
      { $push: { messages: builMessage } },
      { new: true }
    )
      .populate("messages.author", "username photo first_name last_name _id")
      .populate(
        "messages.receiver",
        "username photo first_name last_name  _id"
      );

    // message.socket.to(message.box!).emit("receive_message", {
    //   content: message?.content!,
    //   author: await User.findById(message.author).populate("sync_bank"),
    //   receiver: await User.findById(message.receiver).populate("sync_bank"),
    //   is_delete: false,
    //   timestamp: Date.now(),
    // });

    return boomBox;
  }

  console.log("Message REACHED");

  // create boom box and
  boomBox = new BoomBox({
    box: `${message.author}:${Date.now()}`,
    label: receiver?.username
      ? `${receiver?.username}`
      : `${receiver?.first_name!} ${receiver?.last_name!}`,
    box_type: message.boomBoxType,
  });

  await boomBox.save();

  return await BoomBox.findById(boomBox.id)
    .populate("messages.author", "username photo first_name last_name")
    .populate("messages.receiver", "username photo first_name last_name");
};
