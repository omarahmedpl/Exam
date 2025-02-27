import mongoose, { model, Schema } from "mongoose";

// Define enums for job-related fields
export const jobLocationTypes = {
  ONSITE: "onsite",
  REMOTELY: "remotely",
  HYBRID: "hybrid",
};

export const workingTimeTypes = {
  PART_TIME: "part-time",
  FULL_TIME: "full-time",
};

export const seniorityLevelTypes = {
  FRESH: "fresh",
  JUNIOR: "Junior",
  MID_LEVEL: "Mid-Level",
  SENIOR: "Senior",
  TEAM_LEAD: "Team-Lead",
  CTO: "CTO",
};

export const jobSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: true,
    },
    jobLocation: {
      type: String,
      enum: Object.values(jobLocationTypes),
      required: true,
    },
    workingTime: {
      type: String,
      enum: Object.values(workingTimeTypes),
      required: true,
    },
    seniorityLevel: {
      type: String,
      enum: Object.values(seniorityLevelTypes),
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    technicalSkills: {
      type: [String],
      required: true,
    },
    softSkills: {
      type: [String],
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    closed: {
      type: Boolean,
      default: false,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
jobSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "jobId",
});
jobSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    await mongoose.model("Application").deleteMany({ jobId: this._id });
    next();
  }
);

export const Job = mongoose.models.Job || model("Job", jobSchema);
