import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  console.log(localFilePath);
  try {
    const uploadstream = await cloudinary.uploader.upload(localFilePath, {
      public_id: `Chat_App_${new Date().toISOString().replace(/[:.]/g, "-")}`,
      resource_type: "auto",
      folder: "chat_app",
    });
    fs.unlinkSync(localFilePath);
    return uploadstream;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log("Error while uploading on cloudinary", error);
    return null;
  }
};

export { uploadOnCloudinary };
