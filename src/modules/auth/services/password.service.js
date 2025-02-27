import { otpTypes, User } from "../../../DB/Models/User.model.js";
import { emailEvent, eventTypes } from "../../../utils/event/email.event.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import {
  compareHash,
  generateHash,
} from "../../../utils/security/hash.security.js";
import { generateOTP } from "../../../utils/security/otp.security.js";

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const { otp, hashedOTP } = await generateOTP();

  // Find the user and update OTP array
  const user = await User.findOneAndUpdate(
    { email, isConfirmed: true },
    {
      $push: {
        OTP: {
          code: hashedOTP,
          type: otpTypes.FORGET_PASSWORD,
          expiresIn: new Date(Date.now() + 6 * 60 * 1000),
        },
      },
    },
    { new: true } // Return the updated document
  );

  if (!user) {
    return next(new Error("User Not Found", { cause: 404 }));
  }

  // Emit the email event to send OTP
  emailEvent.emit(eventTypes.FORGET_PASSWORD, { email, otp });

  return successResponse({
    res,
    message: "OTP Sent Successfully",
    statusCode: 200,
    data: {},
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, password } = req.body;

  // Find user and validate OTP within the update operation
  const user = await User.findOneAndUpdate(
    {
      email,
      isConfirmed: true,
      "OTP.code": { $exists: true },
    },
    {
      $pull: {
        OTP: {
          code: otp,
          type: otpTypes.FORGET_PASSWORD,
          expiresIn: { $gt: Date.now() }, // Ensure OTP has not expired
        },
      },
      $set: {
        password : await generateHash({ plain: password }),
        changeCredentialTime: Date.now(),
      },
    },
    { new: true } // Return the updated document
  );

  if (!user) {
    return next(new Error("Invalid OTP or OTP Expired", { cause: 401 }));
  }

  return successResponse({
    res,
    message: "Password Reset Successfully",
    statusCode: 200,
    data: {},
  });
});
