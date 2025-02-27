import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const createCompanySchema = joi
  .object()
  .keys({
    companyName: generalFields.username.required(),
    companyEmail: generalFields.email.required(),
    description: joi.string().required(),
    industry: joi.string().required(),
    address: joi.string().required(),
    numberOfEmployees: joi
      .object()
      .keys({
        from: joi.number().required(),
        to: joi.number().required(),
      })
      .required(),
    HRs: joi.array().items(generalFields._id).required(),
  })
  .required();

export const updateCompanySchema = joi
  .object()
  .keys({
    companyId: generalFields._id.required(),
    companyName: generalFields.username,
    companyEmail: generalFields.email,
    description: joi.string(),
    industry: joi.string(),
    address: joi.string(),
    numberOfEmployees: joi.object().keys({
      from: joi.number().required(),
      to: joi.number().required(),
    }),
    HRs: joi.array().items(generalFields._id),
  })
  .required();

export const deleteCompanySchema = joi
  .object()
  .keys({
    companyId: generalFields._id.required(),
  })
  .required();

export const getCompanySchema = joi
  .object()
  .keys({
    companyName: generalFields.username.required(),
  })
  .required();
