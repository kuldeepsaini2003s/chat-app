import { Server } from "socket.io";
import { Message } from "../model/messageModel.js";
import { Chat } from "../model/ChatModel.js";

let io;
let socket;

const userSocketMap = {};

export const getSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

export const getUserSocketId = () => {
  return userSocketMap;
};

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    console.log("user connected", socket.id);

    const { userId } = socket?.handshake?.query;

    if (userId !== undefined) {
      userSocketMap[userId] = socket.id;
    }

    const receiverSocketId = userSocketMap[userId];

    const undeliveredMessages = await Message.find({
      receiverId: userId,
      status: "sent",
    });

    if (undeliveredMessages.length > 0) {
      const messagesId = undeliveredMessages.map((msg) => msg._id);
      await Message.updateMany(
        { _id: { $in: messagesId } },
        { status: "delivered" }
      );
      undeliveredMessages.forEach((msg) => {
        const senderSocketId = userSocketMap[msg.senderId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageDelivered", msg._id);
          io.to(senderSocketId).emit("messageDelivered", msg._id);
        }
      });
    }

    socket.on("messageDelivered", async (messageId) => {
      const updateStatus = await Message.findByIdAndUpdate(
        messageId,
        {
          status: "delivered",
        },
        { new: true }
      );
      console.log(updateStatus);

      if (updateStatus) {
        const senderSocket = userSocketMap[updateStatus.senderId];
        const receiverSocket = userSocketMap[updateStatus.receiverId];
        io.to(senderSocket).emit("messageDelivered", updateStatus._id);
        io.to(receiverSocket).emit("messageDelivered", updateStatus._id);
      }
    });

    socket.on("messageSeen", async ({ senderId, receiverId }) => {
      try {
        const unSeenMessages = await Message.find({
          status: "delivered",
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        });

        if (unSeenMessages.length > 0) {
          const messageIds = unSeenMessages.map((msg) => msg._id);

          await Message.updateMany(
            { _id: { $in: messageIds } },
            { $set: { status: "seen" } }
          );

          const senderSocket = userSocketMap[senderId];
          const receiverSocket = userSocketMap[receiverId];
          unSeenMessages.forEach((msg) => {
            if (senderSocket) {
              io.to(senderSocket).emit("messageSeen", msg._id);
            }
            if (receiverSocket) {
              io.to(receiverSocket).emit("messageSeen", msg._id);
            }
          });
        }
      } catch (error) {
        console.error("Error in messageSeen handler", error);
      }
    });

    io.emit("getOnlineUser", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
      // delete userSocketMap[userId];
      for (const key in userSocketMap) {
        if (userSocketMap[key] === socket.id) {
          delete userSocketMap[key];
          break;
        }
      }
      io.emit("getOnlineUser", Object.keys(userSocketMap));
    });
  });
}

export { io, initSocket, socket };
