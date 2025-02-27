import {
  otpTypes,
  providerTypes,
  roleTypes,
  User,
} from "../../../DB/Models/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { generateCrypto } from "../../../utils/security/crypto.security.js";
import { compareHash } from "../../../utils/security/hash.security.js";
import { generateOTP } from "../../../utils/security/otp.security.js";
import { emailEvent, eventTypes } from "../../../utils/event/email.event.js";
import { compareSync } from "bcrypt";
import { OAuth2Client } from "google-auth-library";
export const signUp = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    mobilePhone,
    provider,
    role,
    DOB,
  } = req.body;
  const isExists = await User.findOne({ email });
  if (isExists) {
    return next(new Error("User Already Exists", { cause: 409 }));
  }
  const { otp, hashedOTP } = await generateOTP();
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    mobilePhone,
    provider,
    role,
    DOB,
    OTP: [
      {
        code: hashedOTP,
        type: otpTypes.CONFIRM_EMAIL,
        expiresIn: new Date(Date.now() + 6 * 60 * 1000),
      },
    ],
  });
  emailEvent.emit(eventTypes.SEND_CONFIRM_EMAIL, { email, otp });
  await user.save();

  return successResponse({
    res,
    message: "User Created Successfully",
    statusCode: 201,
    data: user,
  });
});

export const confirmOTP = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email, isConfirmed: false });
  if (!user) {
    return next(new Error("User Not Found", { cause: 404 }));
  }
  const otpIndex = user.OTP.findIndex(async (otpData) => {
    return (
      (await compareHash({ plain: otp, cipher: otpData.code })) &&
      otpData.expiresIn > new Date()
    );
  });
  if (otpIndex === -1) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }
  await User.findOneAndUpdate(
    { email, isConfirmed: false },
    {
      isConfirmed: true,
      $pull: {
        OTP: {
          code: user.OTP[otpIndex].code,
        },
      },
    },
    { new: true }
  );
  return successResponse({
    res,
    message: "Email Verified Successfully",
    statusCode: 200,
  });
});

export const signUpWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    return payload;
  }
  const { email_verified, email, name, picture } = await verify();
  // console.log({ email_verified, email, name, picture });
  if (!email_verified) {
    // console.log("LOL");
    return next(new Error("Invalid Account", { cause: 404 }));
  }
  const user = await User.findOne({
    email,
  });
  if (user) {
    return next(new Error("User Already Exists", { cause: 409 }));
  }
  if (!user) {
    const user = new User({
      email: email,
      username: name,
      isConfirmed: email_verified,
      role: roleTypes.USER,
      provider: providerTypes.GOOGLE,
    });
    await user.save();
  }
  const accessToken = accessTokenGeneration({ user });
  const refreshToken = refreshTokenGeneration({ user });
  return successResponse({
    res,
    message: "Done",
    statusCode: 200,
    data: {
      user,
      token: {
        accessToken,
        refreshToken,
      },
    },
  });
});
