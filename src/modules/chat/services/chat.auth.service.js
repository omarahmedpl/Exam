import { socketConnections } from "../../../DB/Models/User.model.js";
import { authenticationSocket } from "../../../middleware/auth.socket.middleware.js";

export const registerSocket = async (socket) => {
  try {
    const { message, user, status } = await authenticationSocket({
      socket,
    });
    if (!user) {
      socket.emit("socketErrorResponse", {
        message,
        status,
      });
    } else {
      socketConnections.set(user?._id?.toString(), socket.id);
    }
    return;
  } catch (error) {
    console.log(error);
  }
};

export const logoutSocket = async (socket) => {
  return socket.on("disconnect", async () => {
    try {
      const { message, user, status } = await authenticationSocket({
        socket,
      });
      if (!user) {
        socket.emit("socketErrorResponse", {
          message,
          status,
        });
      } else {
        socketConnections.delete(user?._id?.toString());
      }
      console.log("Logged Out");

      return;
    } catch (error) {
      console.log(error);
    }
  });
};
