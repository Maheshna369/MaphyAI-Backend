import { getSocket } from "../../config/socket.config";
import { redisClient } from "../../config/redis.config";
const socketListeners = async () => {
  try {
    const io = getSocket();
    io.on("connection", (socket) => {
      console.log(
        `User with ${socket.id} has been connected to server, successfully!`,
      );
    });
  } catch (error) {}
};
