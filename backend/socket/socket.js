import { Server } from "socket.io";
import { Message } from "../model/messageModel.js";
import { Chat } from "../model/ChatModel.js";
import { User } from "../model/UserModel.js";
import { Media } from "../model/MediaModel.js";

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
      origin: [process.env.LOCAL_ORIGIN, process.env.FRONTEND_ORIGIN],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    const { userId } = socket?.handshake?.query;

    if (userId !== undefined) {
      userSocketMap[userId] = socket.id;
    }
    // console.log("socket connect", socket.id);

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

    socket.on("lastMessage", async ({ senderId, receiverId }) => {
      const senderSocket = userSocketMap[senderId];
      const receiverSocket = userSocketMap[receiverId];

      const chat = await Chat.find({
        participants: { $all: [senderId, receiverId] },
      }).populate("lastMessage");

      const media = await Media.find({
        messageId: chat[0].lastMessage._id,
      });

      const imageTypes = ["jpg", "png", "jpeg", "gif", "avif", "svg"];

      const formattedMessage = {
        message: chat[0]?.lastMessage?.message,
        chatId: chat[0]?._id,
        status: chat[0]?.lastMessage?.status,
        time: chat[0]?.lastMessage?.createdAt,
        type: media
          ? imageTypes.includes(media?.type)
            ? "image"
            : "file"
          : null,
        fileName: (media && media?.name) || null,
      };

      io.to(senderSocket).emit("lastMessage", formattedMessage);
      io.to(receiverSocket).emit("lastMessage", formattedMessage);
    });

    io.emit("getOnlineUser", Object.keys(userSocketMap));

    socket.on("disconnect", async () => {
      // console.log("Socket disconnected", userSocketMap[userId]);
      for (const key in userSocketMap) {
        if (userSocketMap[key] === socket.id) {
          await User.findByIdAndUpdate(
            key,
            {
              lastSeen: new Date(),
            },
            { new: true }
          );
          delete userSocketMap[key];
          break;
        }
      }
      io.emit("getOnlineUser", Object.keys(userSocketMap));
    });
  });
}

export { io, initSocket, socket };
