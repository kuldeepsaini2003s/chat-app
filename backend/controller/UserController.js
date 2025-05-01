import { User } from "../model/UserModel.js";
import bcrypt from "bcrypt";
import { uploadOnCloudinary } from "../utils/uploadToCloudinary.js";
import { generateToken } from "../utils/generateToken.js";
import fs from "fs";
import { Chat } from "../model/ChatModel.js";

const option = {
  httpOnly: true,
  // secure: true,
  path: "/",
};

const generateAccessAndRefreshToken = (user) => {
  const accessToken = generateToken(user._id, "10d");
  const refreshToken = generateToken(user._id, "30d");
  return { refreshToken, accessToken };
};

export const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const avatar = req?.file;

    if (!email || !password || !name || !avatar) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required",
      });
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      fs.unlinkSync(avatar.path);
      return res.status(400).json({
        success: false,
        msg: "User already exist",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const avatarUrl = await uploadOnCloudinary(avatar.path);

    const userData = {
      name,
      email,
      password: hashPassword,
      avatar: avatarUrl.secure_url,
    };

    const user = await User.create(userData);

    if (user) {
      const { accessToken, refreshToken } = generateAccessAndRefreshToken(user);
      const newUser = await User.findByIdAndUpdate(user._id, {
        refreshToken,
      }).select("-password -refreshToken -contacts");

      return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json({
          success: true,
          refreshToken,
          accessToken,
          message: "User registered successfully",
          data: newUser,
        });
    }
  } catch (error) {
    console.log("Error while registering user", error);
    return res.status(500).json({
      success: false,
      msg: "something went wrong",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found with this email",
      });
    }

    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      return res.status(400).json({
        success: false,
        msg: "Invalid password",
      });
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    const userData = await User.findById(user._id).select(
      "-password -refreshToken -contacts"
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", refreshToken, option)
      .json({
        success: true,
        data: userData,
        accessToken,
        refreshToken,
        msg: "User logged in successfully",
      });
  } catch (error) {
    console.log("error while logging in user", error);
    return res.status(500).json({
      success: false,
      msg: "something went wrong",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const user = User.findByIdAndUpdate(
      req.user._id,
      { refreshToken: undefined },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    return res
      .status(200)
      .clearCookie("accessToken", option)
      .clearCookie("refreshToken", option)
      .json({
        success: true,
        msg: "user logged out successfully",
      });
  } catch (error) {
    console.log("Error while logging out user", error);
    return res.status(500).json({
      success: false,
      msg: "something went wrong",
    });
  }
};

export const contacts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "contacts",
      select: "name _id avatar",
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Users not found",
      });
    }
    
    const chats = await Chat.find({
      participants: { $all: [user._id], $in: user.contacts },
    })
      .populate({
        path: "participants",
        select: "name _id avatar isGroup lastSeen lastMessage",
        match: { _id: { $ne: user._id } },
      })
      .populate({ path: "lastMessage", select: "message status" });

    const chatMap = new Map();

    const currentUserId = user._id.toString();
    chats.forEach((chat) => {
      if (!chat.isGroup) {
        const otherParticipants = chat.participants.find(
          (participants) => participants?._id.toString() !== currentUserId
        );

        if (otherParticipants) {
          chatMap.set(otherParticipants._id.toString(), {
            lastMessage: chat.lastMessage,
            chatId: chat._id,
          });
        }
      }
    });

    const chatsWithLastMessages = user.contacts.map((contact) => ({
      ...contact.toObject(),
      lastMessage:
        chatMap.get(contact._id.toString())?.lastMessage.message || null,
      status: chatMap.get(contact._id.toString())?.lastMessage.status || null,
      chatId: chatMap.get(contact._id.toString())?.chatId || null,
    }));

    return res.status(200).json({
      success: false,
      msg: "Users list fetched successfully",
      data: chatsWithLastMessages,
    });
  } catch (error) {
    console.log("Error while fetching users list", error);
    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};

export const searchUser = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        msg: "search query is required",
      });
    }

    const query = new RegExp(search, "i");

    const users = await User.find({ name: query }).select("name avatar _id");

    return res.status(200).json({
      success: true,
      msg: "user fetched successfully",
      data: users,
    });
  } catch (error) {
    console.log("Error while searching user", error);
    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};

export const user = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken -contacts"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      msg: "User details fetched successfully",
    });
  } catch (error) {
    console.log("Error while getting user details", error);
    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};
