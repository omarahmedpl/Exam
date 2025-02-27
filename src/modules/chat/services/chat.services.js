import { populate } from "dotenv";
import { findOne } from "../../../DB/db.service.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { Chat } from "../../../DB/Models/Chat.model.js";

export const findChatHistory = asyncHandler(async (req, res, next) => {
  const { destId } = req.params;
  const chats = await Chat.find({
    $or: [
      { $and: [{ senderId: req.user._id }, { receiverId: destId }] },
      { $and: [{ senderId: destId }, { receiverId: req.user._id }] },
    ],
  }).populate([
    { path: "senderId", select: "firstName lastName email profilePic" },
    { path: "receiverId", select: "firstName lastName email profilePic" },
  ]);
  if (!chat) {
    return next(new Error("Chat not found", { cause: 404 }));
  }
  return successResponse({
    res,
    message: "Chat found",
    data: { chats },
  });
});
