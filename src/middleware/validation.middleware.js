import joi from "joi";
import { Types } from "mongoose";
import {
  genderTypes,
  providerTypes,
  roleTypes,
} from "../DB/Models/User.model.js";
import moment from "moment";
import {
  jobLocationTypes,
  seniorityLevelTypes,
  workingTimeTypes,
} from "../DB/Models/JobOpportunity.model.js";
const fileObject = {
  fieldname: joi.string(),
  originalname: joi.string(),
  encoding: joi.string(),
  mimetype: joi.string(),
  destination: joi.string(),
  filename: joi.string(),
  path: joi.string(),
  size: joi.number(),
};
export const checkObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value) ? true : helper.message("Invalid ID");
};
export const generalFields = {
  _id: joi.string().custom(checkObjectId),
  username: joi.string().min(2).max(25).trim(),
  email: joi.string().email({
    tlds: {
      allow: ["com", "net"],
    },
    minDomainSegments: 2,
  }),
  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
  confirmationPassword: joi.string().valid(joi.ref("password")),
  otp: joi.string().pattern(new RegExp(/\d{4}/)).length(4),
  phone: joi.string().pattern(new RegExp(/^\+?\d{10,14}$/)),
  provider: joi.string().valid(...Object.values(providerTypes)),
  role: joi.string().valid(...Object.values(roleTypes)),
  gender: joi.string().valid(...Object.values(genderTypes)),
  DOB: joi.date().max(moment().subtract(18, "years").toDate()),
  fileObject,
  file: joi.object(fileObject),
  companyName: joi.string(),
  jobTitle: joi.string(),
  jobLocation: joi.string().valid(...Object.values(jobLocationTypes)),
  workingTime: joi.string().valid(...Object.values(workingTimeTypes)),
  seniorityLevel: joi.string().valid(...Object.values(seniorityLevelTypes)),
  jobDescription: joi.string(),
  technicalSkills: joi.array().items(joi.string()),
  softSkills: joi.array().items(joi.string()),
};

export const validation = (schema) => {
  return (req, res, next) => {
    const inputData = { ...req.body, ...req.params, ...req.query };
    if (req.file || req.files?.length) {
      inputData.file = req.file || req.files;
    }
    const validationResult = schema.validate(inputData, { abortEarly: false });
    if (validationResult.error) {
      return res.status(400).json({
        message: "Validation Error",
        details: validationResult.error.details,
      });
    } else {
      return next();
    }
  };
};
