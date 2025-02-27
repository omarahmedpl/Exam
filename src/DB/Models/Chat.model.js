import mongoose, { model, Schema } from "mongoose";

// Define the schema for the chat messages
const chatSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        message: {
          type: String,
          required: true,
        },
        senderId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Chat =
  mongoose.models.Chat || model("Chat", chatSchema);
