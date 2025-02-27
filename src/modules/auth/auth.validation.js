import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const signUpSchema = joi
  .object()
  .keys({
    firstName: generalFields.username.required(),
    lastName: generalFields.username.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.required(),
    mobilePhone: generalFields.phone.required(),
    provider: generalFields.provider,
    role: generalFields.role,
    DOB: generalFields.DOB,
  })
  .required();

export const confirmOTPSchema = joi
  .object()
  .keys({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
  })
  .required();

export const loginSchema = joi
  .object()
  .keys({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  })
  .required();

export const signUpWithGoogleSchema = joi
  .object()
  .keys({
    idToken: joi.string().required(),
  })
  .required();

export const forgetPasswordSchema = joi
  .object()
  .keys({
    email: generalFields.email.required(),
  })
  .required();
export const resetPasswordSchema = joi
  .object()
  .keys({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.required(),
    otp: generalFields.otp.required(),
  })
  .required();

export const refreshTokenSchema = joi
  .object()
  .keys({
    refreshToken: joi.string().required(),
  })
  .required();
