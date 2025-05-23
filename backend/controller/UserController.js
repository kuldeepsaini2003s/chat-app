import { User } from "../model/UserModel.js";
import bcrypt from "bcrypt";
import { uploadOnCloudinary } from "../utils/uploadToCloudinary.js";
import { generateToken } from "../utils/generateToken.js";
import fs from "fs";
import { Chat } from "../model/ChatModel.js";
import { Media } from "../model/MediaModel.js";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/sendMail.js";

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

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const createActivationToken = (otp, user) => {
  const payload = { otp: otp, user: user };
  const secret = process.env.JWT_SECRET;
  const option = { expiresIn: "10m" };
  return jwt.sign(payload, secret, option);
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
      select: "name _id avatar lastSeen",
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Users not found",
      });
    }

    const imageTypes = ["jpg", "png", "jpeg", "gif", "avif", "svg"];

    const chats = await Chat.find({
      participants: { $all: [user._id], $elemMatch: { $in: user.contacts } },
    })
      .populate({
        path: "participants",
        select: "name _id avatar isGroup lastMessage",
        match: { _id: { $ne: user._id } },
      })
      .populate("lastMessage");

    const chatMap = new Map();
    const messageIds = [];

    const currentUserId = user?._id?.toString();

    chats.forEach((chat) => {
      if (!chat.isGroup && chat.lastMessage) {
        const otherParticipant = chat.participants.find(
          (p) => p?._id?.toString() !== currentUserId
        );

        const unseenEntry = chat.unSeenMessages?.find(
          (entry) => entry?.user?.toString() === currentUserId
        );

        if (otherParticipant) {
          chatMap.set(otherParticipant?._id?.toString(), {
            lastMessage: chat.lastMessage,
            chatId: chat._id,
            unSeenCount: unseenEntry?.count || 0,
          });
          messageIds.push(chat.lastMessage._id);
        }
      }
    });

    // Fetch all media related to lastMessages
    const mediaDocs = await Media.aggregate([
      { $match: { messageId: { $in: messageIds } } },
      {
        $group: {
          _id: "$messageId",
          lastMedia: { $last: "$$ROOT" }, // get last media doc per message
        },
      },
    ]);

    const mediaMap = new Map();
    mediaDocs.forEach((media) => {
      mediaMap.set(media?._id?.toString(), {
        type: media?.lastMedia?.type,
        name: media?.lastMedia?.name,
      });
    });

    const chatsWithLastMessages = user.contacts.map((contact) => {
      const chatData = chatMap.get(contact?._id?.toString());
      const lastMessage = chatData?.lastMessage;

      const mediaInfo = lastMessage
        ? mediaMap.get(lastMessage?._id?.toString())
        : null;

      return {
        ...contact.toObject(),
        lastMessage: lastMessage?.message || null,
        status: lastMessage?.status || null,
        time: lastMessage?.createdAt || null,
        chatId: chatData?.chatId || null,
        unSeen: chatData?.unSeenCount,
        type: mediaInfo
          ? imageTypes.includes(mediaInfo?.type)
            ? "image"
            : "file"
          : null,
        fileName: (mediaInfo && mediaInfo?.name) || null,
      };
    });

    return res.status(200).json({
      success: true,
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
    const { query } = req.query;

    const userId = req.user._id;

    if (!query) {
      return res.status(400).json({
        success: false,
        msg: "search query is required",
      });
    }

    const searchQuery = new RegExp(query, "i");

    const users = await User.find({
      name: searchQuery,
      _id: { $ne: userId },
    }).select("name avatar _id");

    if (!users.length > 0) {
      return res.status(400).json({
        success: false,
        msg: "Hmm... looks like no one by that name is here yet.",
      });
    }

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

export const refreshToken = async (req, res) => {
  try {
    const token =
      req?.cookies?.refreshToken || req?.header("authorization")?.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        msg: "Unauthorized required",
      });
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (token !== user.refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: "refresh token is not valid" });
    }

    const { refreshToken, accessToken } = generateAccessAndRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, option)
      .cookie("accessToken", accessToken, option)
      .json({
        success: true,
        refreshToken,
        accessToken,
        msg: "Token Updated successfully",
      });
  } catch (error) {
    console.log("Error while refreshing token", error);
    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        msg: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    const otp = generateOTP();
    const resetPasswordToken = createActivationToken(otp, user);

    await sendMail({
      email: user.email,
      subject: "Password Reset Request",
      message: `Hi ${user.name},\n\nYour OTP to reset your password is: ${otp}.\n\nIf you didn't request this, please ignore this email.`,
    });

    return res.status(200).json({
      success: true,
      msg: `An OTP has been sent to ${user.email}`,
      resetToken: resetPasswordToken,
    });
  } catch (error) {
    console.log("Error in forgot password", error);
    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { activation_otp, password } = req.body;
    const authHeader = req.headers["authorization"];
    const verificationToken = authHeader && authHeader.split(" ")[1];

    const tokenVerification = await jwt.verify(
      verificationToken,
      process.env.JWT_SECRET
    );

    if (!tokenVerification) {
      return res.status(400).json({
        success: false,
        msg: "Invalid Token",
      });
    }

    const otp = tokenVerification.otp;

    if (!otp === activation_otp) {
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP",
      });
    }

    const { user: userData } = tokenVerification;

    const { email } = userData;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "User not found",
      });
    }

    const samePassword = await bcrypt.compare(password, user.password);

    if (samePassword) {
      return res.status(400).json({
        success: false,
        msg: "New password cannot be the same as the old password.",
      });
    }

    const newPassword = await bcrypt.hash(password, 10);

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    await sendMail({
      email: user.email,
      subject: "Password Updated",
      message: `Hello ${user.name} your password was successfully updated.`,
    });

    return res.status(200).json({
      success: true,
      msg: "Password updated successfully",
    });
  } catch (error) {
    console.log("Error while resetting password", error);
    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};
