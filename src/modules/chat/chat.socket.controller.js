import { Server } from "socket.io";
import { sendMessage } from "./services/message.service.js";
import { logoutSocket, registerSocket } from "./services/chat.auth.service.js";

let io = undefined;
export const runIo = async (httpServer) => {
  io = new Server(httpServer, {
    cors: "*",
  });
  return io.on("connection", async (socket) => {
    console.log({ token: socket.handshake.auth });
    await registerSocket(socket);
    await sendMessage(socket);
    await logoutSocket(socket);
  });
};

export const getIo = () => {
  return io;
};
