import { model, Schema } from "mongoose";

const chatSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    isGroup: {
      type: Boolean,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      require: true,
    },
    unSeenMessages: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timeStamps: true }
);

export const Chat = model("Chat", chatSchema);
