import { model, Schema } from "mongoose";

const MediaSchema = new Schema(
  {
    messageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    type: String,
    url: String,
    name: String,
    size: Number,
  },
  { timestamps: true }
);

export const Media = model("Media", MediaSchema);
