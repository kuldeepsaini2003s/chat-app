import { Router } from "express";
import {
  login,
  logout,
  register,
  searchUser,
  user,
  users,
} from "../controller/UserController.js";
import { upload } from "../middleware/multerMiddleware.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", upload().single("avatar"), register);
router.post("/login", login);

router.get("/logout", verifyToken, logout);
router.get("/", verifyToken, users);
router.get("/user", verifyToken, user);
router.get("/search", searchUser);

export default router;
