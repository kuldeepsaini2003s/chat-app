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
    lastSeen: {
      type: Date,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      require: true,
    },
  },
  { timeStamps: true }
);

export const Chat = model("Chat", chatSchema);
