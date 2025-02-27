import mongoose, { model, Schema } from "mongoose";

// Define the possible application statuses
export const applicationStatusTypes = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  VIEWED: "viewed",
  IN_CONSIDERATION: "in consideration",
  REJECTED: "rejected",
};

const applicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job", // Refers to the Job collection
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Refers to the User collection (applier)
      required: true,
    },
    userCV: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: Object.values(applicationStatusTypes),
      default: applicationStatusTypes.PENDING,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

applicationSchema.virtual("userData", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true, // Returns a single user object
});
export const Application =
  mongoose.models.Application || model("Application", applicationSchema);
