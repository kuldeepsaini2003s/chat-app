import { Router } from "express";
import { messages, sendMessage } from "../controller/MessageController.js";
import { upload } from "../middleware/multerMiddleware.js";

const router = Router();

router.post(
  "/send",
  upload().fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "media",
      maxCount: 10,
    },
  ]),
  sendMessage
);
router.post("/", messages);

export default router;
