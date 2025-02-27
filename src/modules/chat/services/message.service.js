import { Chat } from "../../../DB/Models/Chat.model.js";
import { Company } from "../../../DB/Models/Company.model.js";
import { User } from "../../../DB/Models/User.model.js";
import { authenticationSocket } from "../../../middleware/auth.socket.middleware.js";

export const sendMessage = (socket) => {
  return socket.on("sendMessage", async (data) => {
    try {
      const {
        user,
        status,
        message: authMessage,
      } = await authenticationSocket({ socket });

      if (!user) {
        return socket.emit("socketErrorResponse", {
          message: authMessage,
          status,
        });
      }

      const userId = user?._id?.toString();
      const { destId, message } = data;

      // 🔹 Ensure `destId` exists in the Users collection before proceeding
      const recipientUser = await User.findById(destId);
      if (!recipientUser) {
        return socket.emit("socketErrorResponse", {
          message: "Recipient user not found.",
          status: 404,
        });
      }

      // 🔹 Check if the user is a company owner
      const isCompanyOwner = await Company.exists({ createdBy: userId });

      let chat = await Chat.findOneAndUpdate(
        {
          $or: [
            { senderId: userId, receiverId: destId },
            { senderId: destId, receiverId: userId },
          ],
        },
        {
          $push: { messages: { senderId: userId, message } },
        },
        { new: true } // 🔥 Ensures we return the updated document
      );

      if (!chat) {
        if (user.isHR || isCompanyOwner) {
          chat = await Chat.create({
            senderId: userId,
            receiverId: destId,
            messages: [{ senderId: userId, message }],
          });
        } else {
          return socket.emit("socketErrorResponse", {
            message: "Only HR or Company Owner can start a conversation.",
            status: 403,
          });
        }
      }

      // 🔹 Emit success response
      socket.emit("successMessage", { chat, message });
      // 🔹 Send message to the recipient's socket
      const recipientSocket = socketConnections.get(destId);
      if (recipientSocket) {
        socket.to(recipientSocket).emit("receiveMessage", { chat, message });
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      socket.emit("socketErrorResponse", {
        message: "An error occurred while sending the message.",
        status: 500,
      });
    }
  });
};
