import { Application } from "../../../DB/Models/Application.model.js";
import { Company } from "../../../DB/Models/Company.model.js";
import { Job } from "../../../DB/Models/JobOpportunity.model.js";
import { emailEvent, eventTypes } from "../../../utils/event/email.event.js";
import { cloudinaryConfig } from "../../../utils/multer/cloudinary.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import ExcelJS from "exceljs";

export const applyApplication = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const job = await Job.findOne({
    _id: jobId,
    closed: false,
  });
  if (!job) {
    return next(new Error("Job not found", { cause: 404 }));
  }
  const isHR = await Company.findOne({
    _id: job.companyId,
    HRs: { $in: [req.user._id] },
  });
  if (isHR) {
    return next(new Error("Unauthorized", { cause: 401 }));
  }
  const applicationExists = await Application.findOne({
    jobId,
    userId: req.user._id,
  });
  if (applicationExists) {
    return next(new Error("Application already exists", { cause: 409 }));
  }
  console.log(req.file?.path);
  if (!req.file?.path) {
    return next(new Error("CV file not found", { cause: 400 }));
  }
  const cvData = await (
    await cloudinaryConfig()
  ).uploader.upload(req.file.path);
  const application = new Application({
    jobId,
    userId: req.user._id,
    userCV: {
      secure_url: cvData.secure_url,
      public_id: cvData.public_id,
    },
  });
  await application.save();
  return successResponse({
    res,
    statusCode: 200,
    message: "Application submitted successfully",
    data: application,
  });
});

export const updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const { applicationId, jobId } = req.params;
  console.log({ applicationId, jobId });
  const application = await Application.findOne({
    _id: applicationId,
    jobId,
  })
    .populate("jobId")
    .populate("userId");
  if (!application) {
    return next(new Error("Application not found", { cause: 404 }));
  }
  const isHR = await Company.findOne({
    _id: application.jobId.companyId,
    HRs: { $in: [req.user._id] },
  });
  if (!isHR) {
    return next(new Error("Unauthorized", { cause: 401 }));
  }
  if (!application) {
    return next(new Error("Application not found", { cause: 404 }));
  }
  console.log(req.user.isHR);
  application.status = status;
  emailEvent.emit(eventTypes.APPLICATION_STATUS, {
    email: application.userId.email,
    applicationStatus: status,
    companyName: isHR.companyName,
    jobTitle: application.jobId.jobTitle,
  });
  await application.save();
  return successResponse({
    res,
    statusCode: 200,
    message: "Application status updated successfully",
    data: application,
  });
});

export const getAllJobApplications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const { jobId } = req.params;
  const applications = await Application.find({ jobId })
    .populate("userId")
    .populate("jobId")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  if (!applications.length || applications[0]?.jobId.closed) {
    return next(new Error("Applications not found", { cause: 404 }));
  }
  const isOwnerOrHR = await Company.findOne({
    _id: applications[0].jobId.companyId,
    $or: [
      { createdBy: req.user._id }, // 🔹 Check if the user is the company owner
      { HRs: { $in: [req.user._id] } }, // 🔹 Check if user is in the HRs array
    ],
  });

  if (!isOwnerOrHR) {
    return next(new Error("Unauthorized", { cause: 401 }));
  }
  const count = await Application.countDocuments({ jobId });
  return successResponse({
    res,
    statusCode: 200,
    message: "Applications fetched successfully",
    data: {
      applications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    },
  });
});

export const createJobsApplicationsExcelSheet = asyncHandler(
  async (req, res, next) => {
    const { companyId } = req.params;
    const { createdAt } = req.query;
    const startOfDay = new Date(createdAt);
    startOfDay.setHours(0, 0, 0, 0); // Set to 00:00:00
    const endOfDay = new Date(createdAt);
    endOfDay.setHours(23, 59, 59, 999); // Set to 23:59:59.999
    // Fetch all open jobs in one query
    const jobs = await Job.find({ companyId, closed: false }).select("_id");

    if (!jobs.length) {
      return next(new Error("Jobs not found", { cause: 404 }));
    }

    // Extract job IDs
    const jobIds = jobs.map((job) => job._id);
    // Fetch all applications in a single query
    const applications = await Application.find({
      jobId: { $in: jobIds },
      createdAt: { $gte: startOfDay, $lte: endOfDay }, // Filter by full day range
    }).populate("userId");

    if (!applications.length) {
      return next(new Error("Applications not found", { cause: 404 }));
    }

    // Verify the requesting user is authorized
    const company = await Company.findOne({
      _id: companyId,
      $or: [
        { createdBy: req.user._id.toString() },
        { HRs: { $in: [req.user._id.toString()] } },
      ],
    });

    if (!company) {
      return next(new Error("Unauthorized", { cause: 401 }));
    }

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Applications");

    // Define columns
    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "CV", key: "cv", width: 40 },
      { header: "Status", key: "status", width: 15 },
    ];

    // Populate worksheet with application data
    applications.forEach((app) => {
      worksheet.addRow({
        name: app.userId?.username || "N/A",
        email: app.userId?.email || "N/A",
        cv: app.userCV?.secure_url || "N/A",
        status: app.status || "N/A",
      });
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${company.companyName} - Applications.xlsx"`
    );

    // Write to buffer and send
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(Buffer.from(buffer));
  }
);
