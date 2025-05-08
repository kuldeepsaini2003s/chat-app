import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    password: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    status: {
      type: String,
    },
    avatar: {
      type: String,
      require: true,
    },    
    lastSeen: {
      type: Date,
    },
    contacts: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timeStamps: true }
);

export const User = model("User", userSchema);
