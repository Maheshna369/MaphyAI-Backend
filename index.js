import env from "dotenv";
import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongo.config.js";
import router from "./routes/main.js";
import { redisClient } from "./config/redis.config.js";
import { initSocket } from "./config/socket.config.js";
env.config();
const app = express();
const server = http.createServer(app);

const port = 5000;

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URI,
    credentials: true,
  }),
);
connectDB();

app.use("/api", router);
app.get("/api/hubspot/test", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts?limit=1",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        },
      },
    );

    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "HubSpot connection failed" });
  }
});
const io = initSocket(server);
io.on("connection", (socket) => {
  console.log("user is connected");
});
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Backend of MaphyAI is running",
    success: true,
  });
});

server.listen(port, (c) => {
  console.log(`Backend of "MaphyAI" is running on port: ${port}: ${c}`);
});
