import { model, Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      require: true,
    },
    read: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export const Notification = model("Notification", notificationSchema);
