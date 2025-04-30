import jwt from "jsonwebtoken";
import { User } from "../model/UserModel.js";

const verifyToken = async (req, res, next) => {
  try {
    const token =
      req?.cookies?.accessToken || req.header("authorization")?.split(" ")[1];
      
    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Unauthorized request",
      });
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "Invalid access token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error while verifying access token", error);
    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};

export { verifyToken };
