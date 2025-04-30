import multer from "multer";
import fs from "fs";
import path from "path";

const dir = "/public/temp";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = () => multer({ storage });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /\.(jpeg|jpg|png|mp4|pdf|doc|docx)$/i;
//   const ext = path.extname(file.originalname);
//   if (allowedTypes.test(ext)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Unsupported file type"), false);
//   }
// };

// export const upload = () =>
//   multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 50 * 1024 * 1024 },
//   }).fields([
//     {
//       name: "avatar",
//       maxCount: 1,
//     },
//     {
//       name: "media",
//       maxCount: 10,
//     },
//   ]);
