import express, { urlencoded } from "express";
import userRoute from "./routes/UserRoute.js";
import messageRoute from "./routes/MessageRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { initSocket } from "./socket/socket.js";
import connectDB from "./db/index.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(
  cors({
    credentials: true,
    origin: [process.env.LOCAL_ORIGIN, process.env.FRONTEND_ORIGIN],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(urlencoded({ limit: "100kb", extended: true }));

app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);

app.get("/", (req, res) => {
  res.send("Server started");
});

connectDB()
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error while connecting MongoDB", error);
  });
