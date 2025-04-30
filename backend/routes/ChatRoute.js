import { Router } from "express";

const router = Router();

router.get("/chat", (req, res) => {
  res.send("Hello kuldeep this is your chat.");
});

export default router;
