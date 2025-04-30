import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      Ref: "User",
      require: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      Ref: "User",
      require: true,
    },
    message: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  { timestamps: true }
);

export const Message = model("Message", messageSchema);
