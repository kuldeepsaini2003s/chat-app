import { Chat } from "../model/ChatModel.js";
import { Message } from "../model/messageModel.js";
import { User } from "../model/UserModel.js";
import { uploadOnCloudinary } from "../utils/uploadToCloudinary.js";
import { Media } from "../model/MediaModel.js";
import { io, getSocketId } from "../socket/socket.js";
import { extraFileExtension } from "../utils/extraFileExtension.js";

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message, tempId } = req.body;
    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required",
      });
    }

    let userFriend = await User.findOne({
      _id: receiverId,
      contacts: { $in: [senderId] },
    });

    if (!userFriend) {
      await Promise.all([
        User.findByIdAndUpdate(receiverId, {
          $addToSet: { contacts: senderId },
        }),
        User.findByIdAndUpdate(senderId, {
          $addToSet: { contacts: receiverId },
        }),
      ]);
    }

    let chats = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chats) {
      chats = await Chat.create({
        participants: [senderId, receiverId],
        messages: [],
        unSeenMessages: [
          { user: senderId, count: 0 },
          { user: receiverId, count: 0 },
        ],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    if (newMessage) {
      chats.messages.push(newMessage._id);
      chats.lastMessage = newMessage._id;

      const unSeen = chats.unSeenMessages.find(
        (entry) => entry?.user?.toString() === receiverId?.toString()
      );

      if (unSeen) {
        unSeen.count += 1;
      } else {
        chats.unSeenMessages.push({ user: receiverId, count: 1 });
      }
    }

    await chats.save();

    const receiverSocketId = getSocketId(receiverId);
    const senderSocketId = getSocketId(senderId);

    if (senderSocketId) {
      const message = await Message.findById(newMessage._id);
      io.to(senderSocketId).emit("newMessage", {
        ...message.toObject(),
        time: message.createdAt,
        tempId,
        chatId: chats._id,
      });
    }

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        ...newMessage.toObject(),
        time: newMessage.createdAt,
        chatId: chats._id,
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Message send successfully",
    });
  } catch (error) {
    console.log("Error while sending message", error);
    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};

export const mediaUpload = async (req, res) => {
  try {
    const { message, senderId, receiverId, tempId } = req.body;
    const mediaFile = req.files;

    if (!mediaFile || !senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required",
      });
    }

    let userFriend = await User.findOne({
      _id: receiverId,
      contacts: { $in: [senderId] },
    });

    if (!userFriend) {
      await Promise.all([
        User.findByIdAndUpdate(receiverId, {
          $addToSet: { contacts: senderId },
        }),
        User.findByIdAndUpdate(senderId, {
          $addToSet: { contacts: receiverId },
        }),
      ]);
    }

    let chats = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chats) {
      chats = await Chat.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    if (!req?.files && req?.files?.media?.length > 0) {
      return res.status(400).json({
        success: false,
        msg: "Media file is required",
      });
    }

    const mediaPromise = req?.files?.media.map(async (file) => {
      const { path, originalname, mimetype } = file;
      const fileUrl = await uploadOnCloudinary(path, mimetype);
      const type = extraFileExtension(fileUrl.secure_url);
      return {
        messageId: newMessage._id,
        url: fileUrl?.secure_url,
        type,
        name: originalname,
        size: fileUrl?.bytes,
      };
    });

    const mediaData = await Promise.all(mediaPromise);

    await Media.insertMany(mediaData);

    chats.messages.push(newMessage._id);
    chats.lastMessage = newMessage._id;

    const unSeen = chats.unSeenMessages.find(
      (entry) => entry?.user?.toString() === receiverId?.toString()
    );

    if (unSeen) {
      unSeen.count += mediaData?.length;
    } else {
      chats.unSeenMessages.push({
        user: receiverId,
        count: mediaData.length,
      });
    }

    await chats.save();

    const receiverSocketId = getSocketId(receiverId);
    const senderSocketId = getSocketId(senderId);

    if (receiverSocketId) {
      const updateMessage = await Message.findByIdAndUpdate(
        newMessage._id,
        {
          status: "delivered",
        },
        {
          new: true,
        }
      );

      const media = await Media.find({ messageId: { $in: updateMessage._id } });

      if (media) {
        io.to(receiverSocketId).emit("newMessage", {
          ...updateMessage.toObject(),
          time: updateMessage.createdAt,
          chatId: chats._id,
          media,
          tempId,
        });
      }

      io.to(receiverSocketId).emit("lastMessage", {
        lastMessage: chats.lastMessage,
      });

      io.emit("messageDelivered", updateMessage?.id);
    }
    if (senderSocketId) {
      const message = await Message.findById(newMessage._id);
      const media = await Media.find({ messageId: { $in: message._id } });

      io.to(senderSocketId).emit("newMessage", {
        ...message.toObject(),
        time: message.createdAt,
        chatId: chats._id,
        media,
        tempId,
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Media uploaded successfully",
    });
  } catch (error) {
    console.log("Error while uploading media", error);
    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};

export const messages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required",
      });
    }

    const chats = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!chats) {
      return res.status(400).json({
        success: false,
        msg: "No conversation found",
      });
    }

    const allMessagesIds = chats.messages.map((m) => m._id);
    const allMedia = await Media.find({ messageId: { $in: allMessagesIds } });
    const mediaMap = {};

    allMedia.map((media) => {
      const id = media.messageId.toString();
      if (!mediaMap[id]) {
        mediaMap[id] = [];
      }
      mediaMap[id].push(media);
    });

    const filteredData = chats.messages.map((message) => ({
      _id: message?._id,
      message: message?.message,
      status: message.status,
      senderId: message.senderId,
      receiverId: message.receiverId,
      time: message.createdAt,
      media: mediaMap[message._id.toString()] || [],
    }));

    return res.status(200).json({
      success: true,
      msg: "messages found successfully",
      data: filteredData,
    });
  } catch (error) {
    console.log("Error while getting messages", error);
    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};
