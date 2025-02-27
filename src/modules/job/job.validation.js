import joi from "joi";
import {
  jobLocationTypes,
  seniorityLevelTypes,
  workingTimeTypes,
} from "../../DB/Models/JobOpportunity.model.js";
import { generalFields } from "../../middleware/validation.middleware.js";
import { applicationStatusTypes } from "../../DB/Models/Application.model.js";

export const addJobSchema = joi
  .object()
  .keys({
    jobTitle: generalFields.jobTitle.required(),
    jobLocation: generalFields.jobLocation.required(),
    workingTime: generalFields.workingTime.required(),
    seniorityLevel: generalFields.seniorityLevel.required(),
    jobDescription: generalFields.jobDescription.required(),
    technicalSkills: generalFields.technicalSkills.required(),
    softSkills: generalFields.softSkills.required(),
    companyId: generalFields._id,
  })
  .required();

export const updateJobSchema = joi
  .object()
  .keys({
    jobId: generalFields._id.required(),
    jobTitle: generalFields.jobTitle,
    jobLocation: generalFields.jobLocation,
    workingTime: generalFields.workingTime,
    seniorityLevel: generalFields.seniorityLevel,
    jobDescription: generalFields.jobDescription,
    technicalSkills: generalFields.technicalSkills,
    softSkills: generalFields.softSkills,
  })
  .required();

export const deleteJobSchema = joi
  .object()
  .keys({
    jobId: generalFields._id.required(),
  })
  .required();

export const getJobSchema = joi
  .object()
  .keys({
    companyId: generalFields._id,
    jobId: generalFields._id,
    companyName: generalFields.companyName,
    jobTitle: generalFields.jobTitle,
    jobLocation: generalFields.jobLocation,
    workingTime: generalFields.workingTime,
    seniorityLevel: generalFields.seniorityLevel,
    page: joi.number().min(1),
    limit: joi.number().min(1),
    sort: joi.string(),
  })
  .required();

export const updateApplicationStatusSchemaSchema = joi
  .object()
  .keys({
    jobId: generalFields._id.required(),
    applicationId: generalFields._id.required(),
    status: joi.string().valid(...Object.values(applicationStatusTypes)),
  })
  .required();

export const getAllJobApplicationsSchema = joi
  .object()
  .keys({
    jobId: joi.string().required(),
    page: joi.number().min(1),
    limit: joi.number().min(1),
  })
  .required();

export const applyApplicationSchema = joi
  .object()
  .keys({
    jobId: generalFields._id.required(),
  })
  .required();


export const createJobsApplicationsExcelSheetSchema = joi
  .object()
  .keys({
    companyId: generalFields._id.required(),
    createdAt: joi.string().required(),
  })
  .required();
