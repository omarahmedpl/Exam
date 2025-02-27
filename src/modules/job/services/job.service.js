import { Company } from "../../../DB/Models/Company.model.js";
import { Job } from "../../../DB/Models/JobOpportunity.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";

export const addJob = asyncHandler(async (req, res, next) => {
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    companyId,
  } = req.body;
  const isUserHR = await Company.findOne({
    _id: companyId,
    deletedAt: {
      $exists: false,
    },
    approvedByAdmin: true,
    bannedAt: {
      $exists: false,
    },
  }).or([
    { HRs: { $in: req.user._id } },
    {
      createdBy: req.user._id,
    },
  ]);
  if (!isUserHR) {
    return next(new Error("You are not authorized to add job", { cause: 403 }));
  }
  const job = new Job({
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    companyId,
    addedBy: req.user._id,
  });
  await job.save();
  return successResponse({
    res,
    statusCode: 201,
    message: "Job added successfully",
    data: job,
  });
});

export const updateJob = asyncHandler(async (req, res, next) => {
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body;
  const checkJob = await Job.findOne({
    _id: req.params.jobId,
    addedBy: req.user._id,
  });
  if (!checkJob) {
    return next(new Error("Job not found", { cause: 404 }));
  }
  const job = await Job.updateOne(
    { _id: req.params.jobId, addedBy: req.user._id },
    {
      jobTitle: jobTitle || checkJob.jobTitle,
      jobLocation: jobLocation || checkJob.jobLocation,
      workingTime: workingTime || checkJob.workingTime,
      seniorityLevel: seniorityLevel || checkJob.seniorityLevel,
      jobDescription: jobDescription || checkJob.jobDescription,
      technicalSkills: technicalSkills || checkJob.technicalSkills,
      softSkills,
      updatedBy: req.user._id,
      companyId: checkJob.companyId,
      addedBy: checkJob.addedBy,
    }
  );
  return successResponse({
    res,
    statusCode: 201,
    message: "Job Updated successfully",
    data: job,
  });
});

export const deleteJob = asyncHandler(async (req, res, next) => {
  console.log(req.params.jobId);
  const job = await Job.findOne({
    _id: req.params.jobId,
  });
  if (!job) {
    return next(new Error("Job not found", { cause: 404 }));
  }
  const companyId = job.companyId;
  const isUserHR = await Company.findOne({
    _id: companyId,
    deletedAt: {
      $exists: false,
    },
    approvedByAdmin: true,
    HRs: { $in: req.user._id },
    bannedAt: {
      $exists: false,
    },
  });
  if (!isUserHR) {
    return next(
      new Error("You are not authorized to delete job", { cause: 403 })
    );
  }
  await Job.updateOne(
    { _id: req.params.jobId, companyId },
    {
      closed: true,
    }
  );
  return successResponse({
    res,
    statusCode: 201,
    message: "Job Deleted successfully",
  });
});

const buildJobQuery = (queryParams) => {
  const {
    companyId,
    jobId,
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
  } = queryParams;

  let query = {};

  if (companyId) {
    query.companyId = companyId; // 🔥 Filters by company ID if provided
  }
  if (jobId) {
    query._id = jobId; // 🔥 Filters by job ID but does not skip other filters
  }
  if (jobTitle) {
    query.jobTitle = { $regex: jobTitle, $options: "i" }; // Case-insensitive search
  }
  if (jobLocation) {
    query.jobLocation = jobLocation;
  }
  if (workingTime) {
    query.workingTime = workingTime;
  }
  if (seniorityLevel) {
    query.seniorityLevel = seniorityLevel;
  }

  return query;
};

// ✅ GET JOBS (All or Single)
export const getJobs = asyncHandler(async (req, res, next) => {
  const {
    companyName, // 🔹 Optional: Search by company name
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    page = 1,
    limit = 10,
    sort = "createdAt",
  } = req.query;

  const { companyId, jobId } = req.params; // 🔥 companyId is optional

  let finalCompanyId = companyId; // 🔹 Use `companyId` if available

  // 🔹 If `companyId` is not provided but `companyName` is, fetch the company ID
  if (!companyId && companyName) {
    const company = await Company.findOne({
      companyName: { $regex: companyName, $options: "i" },
    });
    if (!company) {
      return next(new Error("Company Not Found", { cause: 404 }));
    }
    finalCompanyId = company._id; // 🔥 Now we have the `companyId`
  }

  // 🔹 Build query with all filters
  const query = buildJobQuery({
    companyId: finalCompanyId, // 🔹 Can be `null` if neither `companyId` nor `companyName` is provided
    jobId,
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
  });

  // 🔹 If `jobId` is provided, fetch a single job
  if (jobId) {
    const job = await Job.findOne(query); // 🔥 Uses the same query structure
    if (!job) {
      return next(new Error("Job Not Found", { cause: 404 }));
    }
    return successResponse({
      res,
      message: "Job Fetched Successfully",
      data: job,
    });
  }

  // 🔹 Apply pagination and sorting for multiple jobs
  const skip = (page - 1) * limit;
  const totalCount = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ [sort]: -1 });

  return successResponse({
    res,
    message: "Jobs Fetched Successfully",
    data: {
      jobs,
      totalCount,
      page,
      limit,
    },
  });
});

export const getFilteredJobs = asyncHandler(async (req, res) => {
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    technicalSkills,
    page = 1,
    limit = 10,
    sort = "createdAt",
  } = req.query;

  // 🔹 Build query based on filters
  const query = buildJobQuery({
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    technicalSkills,
  });

  // 🔹 Apply pagination and sorting
  const skip = (page - 1) * limit;
  const totalCount = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ [sort]: -1 });
  return successResponse({
    res,
    message: "Jobs Fetched Successfully",
    data: {
      jobs,
      totalCount,
      page,
      limit,
    },
  });
});
