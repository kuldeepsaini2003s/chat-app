import { Router } from "express";
import {
  login,
  logout,
  register,
  searchUser,
  user,
  contacts,
  refreshToken,
} from "../controller/UserController.js";
import { upload } from "../middleware/multerMiddleware.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", upload().single("avatar"), register);
router.post("/login", login);
router.get("/refreshToken", refreshToken);

router.get("/logout", verifyToken, logout);
router.get("/contacts", verifyToken, contacts);
router.get("/", verifyToken, user);
router.get("/search", verifyToken, searchUser);

export default router;
