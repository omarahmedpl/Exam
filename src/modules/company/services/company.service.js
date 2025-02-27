import { Company } from "../../../DB/Models/Company.model.js";
import { Job } from "../../../DB/Models/JobOpportunity.model.js";
import { roleTypes, User } from "../../../DB/Models/User.model.js";
import { cloudinaryConfig } from "../../../utils/multer/cloudinary.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";

const checkHRs = async (HRs) => {
  // Validate HRs
  const invalidHRs = [];
  const validHRs = [];

  for (const hrId of HRs) {
    const hrExists = await User.findOne({
      _id: hrId,
      isHR: true,
      deletedAt: {
        $exists: false,
      },
    }); // Check if the HR exists in the User collection
    if (!hrExists) {
      invalidHRs.push(hrId); // Collect invalid HR IDs
    } else {
      validHRs.push(hrId); // Collect valid HR IDs
    }
  }
  return validHRs;
};
const checkValidNameAndEmail = async (companyName, companyEmail, next) => {
  const isExists = await Company.findOne({
    approvedByAdmin: true,
    deletedAt: {
      $exists: false,
    },
  }).or([{ companyName }, { companyEmail }]);
  if (isExists) {
    return next(new Error("Company already exists", { cause: 409 }));
  }
};
export const createCompany = asyncHandler(async (req, res, next) => {
  const {
    companyName,
    companyEmail,
    description,
    industry,
    address,
    numberOfEmployees,
    HRs,
  } = req.body;
  await checkValidNameAndEmail(companyName, companyEmail, next);
  const validHRs = await checkHRs(HRs);
  const company = new Company({
    companyName,
    companyEmail,
    description,
    industry,
    address,
    numberOfEmployees,
    HRs: validHRs,
    createdBy: req.user._id,
  });
  await company.save();
  return successResponse({
    res,
    statusCode: 201,
    message: "Company created successfully",
    data: company,
  });
});

export const updateCompanyData = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await Company.findOne({
    _id: companyId,
    approvedByAdmin: true,
    deletedAt: {
      $exists: false,
    },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("You're not authorized", { cause: 403 }));
  }
  const {
    companyName,
    companyEmail,
    description,
    industry,
    address,
    numberOfEmployees,
    HRs,
  } = req.body;
  await checkValidNameAndEmail(companyName, companyEmail, next);
  let validHRs;
  if (HRs?.length) {
    validHRs = await checkHRs(HRs);
    console.log(validHRs);
  }
  company.companyName = companyName || company.companyName;
  company.companyEmail = companyEmail || company.companyEmail;
  company.description = description || company.description;
  company.industry = industry || company.industry;
  company.address = address || company.address;
  company.numberOfEmployees = numberOfEmployees || company.numberOfEmployees;
  company.HRs = validHRs || company.HRs;
  await company.save();
  return successResponse({
    res,
    statusCode: 200,
    message: "Company updated successfully",
    data: company,
  });
});

export const deleteCompany = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await Company.findOne({
    _id: companyId,
    approvedByAdmin: true,
    deletedAt: {
      $exists: false,
    },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  if (
    company.createdBy.toString() !== req.user._id.toString() ||
    req.user.role !== roleTypes.ADMIN
  ) {
    return next(new Error("You're not authorized", { cause: 403 }));
  }
  company.deletedAt = new Date();
  await company.save();
  return successResponse({
    res,
    statusCode: 200,
    message: "Company deleted successfully",
  });
});

export const getCompanyData = asyncHandler(async (req, res, next) => {
  const { companyName } = req.query;
  console.log(companyName);
  const company = await Company.findOne({
    companyName,
    approvedByAdmin: true,
    deletedAt: {
      $exists: false,
    },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  return successResponse({
    res,
    statusCode: 200,
    message: "Company fetched successfully",
    data: company,
  });
});

export const deleteCompanyLogo = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await Company.findOne({
    _id: companyId,
    approvedByAdmin: true,
    deletedAt: {
      $exists: false,
    },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("You're not authorized", { cause: 403 }));
  }
  if (company.logo && company.logo.public_id) {
    await (await await cloudinaryConfig.uploader()).uploader.destroy(company.logo.public_id);
  }
  company.logo = null;
  await company.save();
  return successResponse({
    res,
    statusCode: 200,
    message: "Company logo deleted successfully",
  });
});

export const deleteCompanyCoverPic = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await Company.findOne({
    _id: companyId,
    approvedByAdmin: true,
    deletedAt: {
      $exists: false,
    },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("You're not authorized", { cause: 403 }));
  }
  if (company.coverPic && company.coverPic.public_id) {
    await (
      await cloudinaryConfig()
    ).uploader.destroy(company.coverPic.public_id);
  }
  company.coverPic = null;
  await company.save();
  return successResponse({
    res,
    statusCode: 200,
    message: "Company cover pic deleted successfully",
  });
});

export const uploadCompanyLogo = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await Company.findOne({
    _id: companyId,
    approvedByAdmin: true,
    deletedAt: {
      $exists: false,
    },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("You're not authorized", { cause: 403 }));
  }
  if (company.logo && company.logo.public_id) {
    await (await cloudinaryConfig()).uploader.destroy(company.logo.public_id);
  }
  const imageData = await (
    await cloudinaryConfig()
  ).uploader.upload(req.file.path);
  console.log(imageData);

  company.logo = {
    secure_url: imageData.secure_url,
    public_id: imageData.public_id,
  };
  await company.save();
  return successResponse({
    res,
    statusCode: 200,
    message: "Company logo uploaded successfully",
  });
});

export const uploadCompanyCoverPic = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await Company.findOne({
    _id: companyId,
    approvedByAdmin: true,
    deletedAt: {
      $exists: false,
    },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("You're not authorized", { cause: 403 }));
  }
  if (company.coverPic && company.coverPic.public_id) {
    await (
      await cloudinaryConfig()
    ).uploader.destroy(company.coverPic.public_id);
  }
  const imageData = await (
    await cloudinaryConfig()
  ).uploader.upload(req.file.path);
  company.coverPic = {
    secure_url: imageData.secure_url,
    public_id: imageData.public_id,
  };
  await company.save();
  return successResponse({
    res,
    statusCode: 200,
    message: "Company logo uploaded successfully",
  });
});

export const getRelatedJobs = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await Company.findOne({
    _id: companyId,
    approvedByAdmin: true,
    deletedAt: {
      $exists: false,
    },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  const jobs = await Job.find({
    companyId,
    deletedAt: {
      $exists: false,
    },
  });
  if (!jobs.length) {
    return next(new Error("No jobs found", { cause: 404 }));
  }
  return successResponse({
    res,
    statusCode: 200,
    message: "Jobs fetched successfully",
    data: jobs,
  });
});

