import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const updateBasicInfoSchema = joi
  .object()
  .keys({
    mobilePhone: generalFields.phone,
    DOB: generalFields.DOB,
    firstName: generalFields.username,
    lastName: generalFields.username,
    gender: generalFields.gender,
  })
  .required();

export const getAnotherUserDataSchema = joi
  .object()
  .keys({
    userId: generalFields._id,
  })
  .required();

export const updatePasswordSchema = joi
  .object()
  .keys({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.required(),
    confirmPassword: generalFields.password
      .valid(joi.ref("newPassword"))
      .required(),
  })
  .required();

