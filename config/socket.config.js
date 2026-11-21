import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  if (io) {
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URI,
      credentials: true,
    },
  });

  console.log("Socket.IO initialized");

  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized. Call initSocket(server) first.",
    );
  }

  return io;
};
