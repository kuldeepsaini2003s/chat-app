import { Router } from "express";
import {
  mediaUpload,
  messages,
  sendMessage,
} from "../controller/MessageController.js";
import { upload } from "../middleware/multerMiddleware.js";

const router = Router();

router.post("/send", sendMessage);
router.post(
  "/mediaUpload",
  upload().fields([
    {
      name: "media",
      maxCount: 10,
    },
  ]),
  mediaUpload
);
router.post("/", messages);

export default router;
