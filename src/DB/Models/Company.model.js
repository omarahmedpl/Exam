import mongoose, { model, Schema } from "mongoose";

export const companySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    numberOfEmployees: {
      type: {
        from: Number,
        to: Number,
      },
      required: true,
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Refers to User collection
      required: true,
    },
    logo: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    HRs: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Refers to User collection
      },
    ],
    bannedAt: Date,
    deletedAt: Date,
    legalAttachment: {
      secure_url: String,
      public_id: String,
    },
    approvedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

companySchema.virtual("jobs", {
  ref: "Job",
  localField: "_id",
  foreignField: "companyId",
});

companySchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const jobs = await mongoose.model("Job").find({ companyId: this._id });
    const jobIds = jobs.map((job) => job._id);
    await mongoose.model("Application").deleteMany({ jobId: { $in: jobIds } });
    await mongoose.model("Job").deleteMany({ companyId: this._id });
    next();
  }
);

export const Company =
  mongoose.models.Company || model("Company", companySchema);
