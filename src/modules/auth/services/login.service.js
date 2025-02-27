import { OAuth2Client } from "google-auth-library";
import {
  providerTypes,
  roleTypes,
  User,
} from "../../../DB/Models/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { compareHash } from "../../../utils/security/hash.security.js";
import {
  accessTokenGeneration,
  refreshTokenGeneration,
  verifyToken,
} from "../../../utils/security/jwt.security.js";
import { successResponse } from "../../../utils/response/success.response.js";

export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
    provider: providerTypes.SYSTEM,
  });

  if (!user) {
    return next(new Error("User Not Found", { cause: 404 }));
  }

  if (!user.isConfirmed) {
    return next(new Error("User Not Confirmed", { cause: 403 }));
  }
  
  if (! await compareHash({ plain: password, cipher: user.password })) {
    return next(new Error("Invalid Password", { cause: 401 }));
  }

  const accessToken = accessTokenGeneration({ user });
  const refreshToken = refreshTokenGeneration({ user });
  return successResponse({
    res,
    message: "Done",
    statusCode: 200,
    data: {
      token: {
        accessToken,
        refreshToken,
      },
    },
  });
});

export const loginWithGmail = asyncHandler(async (req, res, next) => {
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
    isConfirmed: true,
  });
  if (user.provider !== providerTypes.GOOGLE) {
    return next(new Error("Invalid Account", { cause: 404 }));
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

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  const decoded = verifyToken({
    token: refreshToken,
    secret: process.env.USER_REFRESH_TOKEN,
  });
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new Error("User Not Found", { cause: 404 }));
  }
  if (user.changeCredentialTime > decoded.iat) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
  const accessToken = accessTokenGeneration({ user });
  return successResponse({
    res,
    message: "Done",
    statusCode: 200,
    data: {
      accessToken,
    },
  });
});
